<template>
  <div class="chart-container">
    <div class="title">
      <div class="text">案件性质分类</div>
      <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { calculateDynamicYAxis, tooltip, grid } from '@/utils/dashboard';
  import { CASE_COLOR, PERCENT_COLOR } from '@/utils/dashboard';
  import Pagination from '@/components/Pagination/index.vue';

  const caseStatistics = [
    {
      category: '社会权力',
      caseCount: 157,
      satisfactionRate: 0.98,
    },
    {
      category: '交通管理',
      caseCount: 178,
      satisfactionRate: 0.86,
    },
    {
      category: '公共安全',
      caseCount: 117,
      satisfactionRate: 0.94,
    },
    {
      category: '公共服务',
      caseCount: 78,
      satisfactionRate: 0.84,
    },
    {
      category: '农村管理',
      caseCount: 175,
      satisfactionRate: 0.88,
    },
    {
      category: '邮政业服务管理',
      caseCount: 136,
      satisfactionRate: 0.93,
    },
    {
      category: '环境保护',
      caseCount: 73,
      satisfactionRate: 0.91,
    },
    {
      category: '市政',
      caseCount: 63,
      satisfactionRate: 0.66,
    },
    {
      category: '市容市貌',
      caseCount: 86,
      satisfactionRate: 0.86,
    },
    {
      category: '城市绿化',
      caseCount: 90,
      satisfactionRate: 0.9,
    },
  ];

  // 案件类型统计数据
  const seriesData = [
    {
      label: '案件数量/件',
      data: caseStatistics.map((item) => item.caseCount),
      color: CASE_COLOR.rgbStr, // 蓝色
      yAxisIndex: 0,
    },
    {
      label: '满意率',
      data: caseStatistics.map((item) => item.satisfactionRate * 100),
      color: PERCENT_COLOR.rgbStr, // 橙色
      yAxisIndex: 1,
    },
  ];

  const onPrevPage = () => {
    console.log('上一页');
  };
  const onNextPage = () => {
    console.log('下一页');
  };

  const xAxisData = caseStatistics.map((item) => item.category);

  const chartRef = ref(null);
  let chartInstance = null;

  const { max, interval } = calculateDynamicYAxis(seriesData[0].data);

  // 通用 pattern 生成器
  const createPattern = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 4;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 10, 2);
    return canvas;
  };

  const setChartOption = () => {
    if (!chartInstance) return;
    const option = {
      tooltip,
      grid,
      xAxis: {
        data: xAxisData,
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
          name: seriesData.find((s) => s.yAxisIndex === 0)?.label || '',
          nameTextStyle: {
            color: '#B0E1D9',
            fontSize: 14,
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
          name: seriesData.find((s) => s.yAxisIndex === 1)?.label || '',
          nameTextStyle: {
            color: '#B0E1D9',
            fontSize: 14,
            align: 'left',
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
      series: seriesData.map((s) => ({
        name: s.label,
        type: 'bar',
        data: s.data,
        yAxisIndex: s.yAxisIndex,
        barWidth: 10,
        barCategoryGap: '200%',
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

    chartInstance.setOption(option);
  };

  const initChart = () => {
    chartInstance = echarts.init(chartRef.value);
    setChartOption();
  };

  const resizeChart = () => {
    chartInstance && chartInstance.resize();
  };

  onMounted(() => {
    console.log('1111');
    initChart();
    window.addEventListener('resize', resizeChart);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    if (chartInstance) {
      chartInstance.dispose();
    }
  });

  // 监听 props 数据变化，重新渲染
  watch(
    () => [seriesData, xAxisData],
    () => {
      nextTick(() => {
        setChartOption();
      });
    },
    { deep: true }
  );
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
      }
    }
    .chart {
      width: 100%;
      height: 440px;
    }
  }
</style>
