<template>
  <div class="chart-container">
    <div class="title">
      <div class="left">
        <div class="text">案件类型统计</div>
        <DispatchTabs :onTabChange="onTabChange" />
      </div>
      <Pagination :currentPage="currentPage" :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
  import * as echarts from 'echarts';
  import { calculateDynamicYAxis, tooltip, grid, CASE_COLOR, YES_PERCENT_COLOR } from '@/utils/dashboard';
  import Pagination from '@/components/Pagination/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { message } from 'ant-design-vue';
  import { getQuestionTypeCountList } from '@/api/complaint/statistic';
  import { SourceTypeDefault } from '/@/enums/statisticEnum';

  type CaseStatistics = { caseCount: number; questionName: string; satisfyRate: number };
  const allCaseStatistics = ref<CaseStatistics[]>([]);
  const currentCaseStatistics = ref<CaseStatistics[]>([]);
  const currentPage = ref(1);

  // 案件类型统计数据
  const seriesData = ref<
    {
      label: string;
      data: number[];
      color: string;
      yAxisIndex: number;
    }[]
  >([]);

  const onTabChange = (sourceType) => {
    fetchData(sourceType);
  };

  const onPrevPage = () => {
    console.log('上一页');
    currentPage.value = 1;
    currentCaseStatistics.value = allCaseStatistics.value.slice(0, 10);
    initData();
  };
  const onNextPage = () => {
    console.log('下一页');
    currentPage.value = 2;
    currentCaseStatistics.value = allCaseStatistics.value.slice(10, 20);
    initData();
  };

  const xAxisData = ref<string[]>([]);

  const chartRef = ref(null);
  let chartInstance = shallowRef<echarts.EChartsType | null>(null);

  // 通用 pattern 生成器
  const createPattern = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 4;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 10, 2);
    }
    return canvas;
  };

  const setChartOption = () => {
    if (!chartInstance.value || seriesData.value.length === 0) return;
    const { max, interval } = calculateDynamicYAxis(seriesData.value[0].data);
    const option = {
      tooltip,
      grid,
      xAxis: {
        data: xAxisData.value,
        axisTick: {
          alignWithLabel: true,
        },
        boundaryGap: true,
        axisLabel: {
          color: '#fff',
          fontSize: 14,
          interval: 0,
          formatter: function (value) {
            if (value.length > 4) {
              return value.replace(/(.{4})/g, '$1\n');
            }
            return value;
          }, // 允许换行必须配置
          rich: {
            wrap: {
              width: 60, // 每行宽度
              overflow: 'break', // 自动换行
            },
          },
        },
        axisLine: {
          lineStyle: {
            color: '#30665D',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '诉件数/件',
          nameTextStyle: {
            color: '#B0E1D9',
            fontSize: 14,
            padding: [0, 0, 10, 0],
          },
          position: 'left',
          max,
          interval,
          axisLabel: {
            color: '#B0E1D9',
          },
          splitLine: {
            show: false,
          },
        },
        {
          type: 'value',
          name: '百分比',
          nameTextStyle: {
            color: '#B0E1D9',
            fontSize: 14,
            align: 'left',
            padding: [0, 0, 10, 0],
          },
          position: 'right',
          max: 100,
          min: 0,
          interval: 20,
          axisLabel: {
            formatter: '{value}%',
            color: '#B0E1D9',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#255B5B',
            },
          },
          alignTicks: true,
        },
      ],
      series: seriesData.value.map((s) => ({
        name: s.label,
        type: 'bar',
        data: s.data,
        yAxisIndex: s.yAxisIndex,
        barWidth: 10,
        barquestionNameGap: '200%',
        barGap: '200%',
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          formatter: function (params) {
            return `{value|${params.value}}\n{block|}`;
          },
          rich: {
            value: {
              color: '#fff',
              align: 'center',
              padding: [0, 0, 4, 0],
            },
            block: {
              height: 2,
              width: 14,
              backgroundColor: 'RGBA(255, 252, 251, 0.9)',
              align: 'center',
            },
          },
          offset: [0, 6], // 调整标签位置，向上偏移
        },
        itemStyle: {
          color: {
            type: 'pattern',
            image: createPattern(`rgba(${s.color}, 0.9)`),
            repeat: 'repeat',
          },
          borderColor: 'transparent',
        },
        z: 2,
      })),
    };

    chartInstance.value.setOption(option);
  };

  // 调整图表大小
  const resizeChart = () => {
    setTimeout(() => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    }, 0);
  };
  const refreshData = () => {
    fetchData(SourceTypeDefault);
  };

  onMounted(() => {
    // 在mounted阶段只初始化DOM元素，不设置options
    if (chartRef.value && !chartInstance.value) {
      chartInstance.value = echarts.init(chartRef.value);
    }

    // 先获取数据
    fetchData(SourceTypeDefault);

    // 添加resize监听
    window.addEventListener('resize', resizeChart);

    // 监听刷新数据事件
    window.addEventListener('refresh-runtime-data', refreshData);
  });

  onBeforeUnmount(() => {
    // 移除事件监听器
    window.removeEventListener('resize', resizeChart);
    window.removeEventListener('refresh-runtime-data', refreshData);
    // 销毁图表实例
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }
  });

  const fetchData = async (sourceType) => {
    let parmas = { sourceType };
    try {
      const res: any = await getQuestionTypeCountList(parmas);
      console.log('res', res);
      allCaseStatistics.value = res;
      currentPage.value = 1;
      currentCaseStatistics.value = allCaseStatistics.value.slice(0, 10);
      initData();
    } catch (error) {
      message.error('获取数据失败');
    }
  };

  const initData = () => {
    xAxisData.value = currentCaseStatistics.value.map((item) => item.questionName);
    seriesData.value = [
      {
        label: '诉件数/件',
        data: currentCaseStatistics.value.map((item) => item.caseCount),
        color: CASE_COLOR.rgbStr, // 蓝色
        yAxisIndex: 0,
      },
      {
        label: '百分比',
        data: currentCaseStatistics.value.map((item) => item.satisfyRate),
        color: YES_PERCENT_COLOR.rgbStr, // 橙色
        yAxisIndex: 1,
      },
    ];
    // 确保有数据后再设置图表选项
    if (seriesData.value.length > 0 && seriesData.value[0].data.length > 0) {
      // 如果图表实例不存在，先创建
      if (chartRef.value && !chartInstance.value) {
        chartInstance.value = echarts.init(chartRef.value);
      }
      setChartOption();
      // 设置选项后调整大小
      resizeChart();
    }
  };
</script>

<style scoped lang="less">
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .title {
      width: 100%;
      height: 43px;
      background-image: url(@/assets/images/runtime/sub-title-bg.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 20px;

      .left {
        display: flex;
        align-items: center;
        .text {
          font-size: 20px;
          color: #ffffff;
          line-height: 40px;
          text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
          text-align: left;
          background: linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #57debd 100%);
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
          padding-left: 35px;
          margin-right: 30px;
        }
      }
    }
    .chart {
      width: 100%;
      height: 100%;
    }
  }
</style>
