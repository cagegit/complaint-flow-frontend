<template>
  <div class="title">
    <div class="title-left">
      <div class="text">诉件统计</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <div class="title-right">
      <CaseLabelBox />
      <div style="width: 24px"></div>
      <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
    </div>
  </div>
  <div class="chart-container">
    <TimeSwiper :startTime="getDayString(startTimeRef)" :endTime="getDayString(endTimeRef)" :onPrev="onRangePrev" :onNext="onRangeNext" />
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  import { tooltip, CASE_COLOR, YES_PERCENT_COLOR, NO_PERCENT_COLOR, grid, getDayString } from '@/utils/dashboard';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { getOrderLineCountList, getTimeCycle, getYearCycle } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue';
  import { RangeTypeEnum, RomplaintTypeTabs, SourceTypeDefault } from '/@/enums/statisticEnum';
  import TimeSwiper from '@/components/TimeSwiper/index.vue';

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

  const offsetRef = ref(0); // 偏移量
  const sourceTypeRef = ref(SourceTypeDefault); // 来源类型
  const rangeTypeRef = ref(RangeTypeEnum.MONTH); // 时间周期类型
  const startTimeRef = ref(''); // 时间周期类型
  const endTimeRef = ref(''); // 时间周期类型

  const chartData = ref<{
    labelNames: string[]; // 标签名称
    caseCounts: number[]; // 诉件数
    doubleYesRate: number[]; // 双是率
    doubleNoRate: number[]; // 双否率
  }>({
    labelNames: [],
    caseCounts: [],
    doubleYesRate: [],
    doubleNoRate: [],
  });

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      const option = {
        grid,
        title: {
          show: false,
        },
        // 浮窗
        tooltip: {
          ...tooltip,
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#6e7079',
              type: 'solid',
            },
          },
        },
        legend: {
          show: false,
        },
        xAxis: {
          type: 'category',
          data: chartData.value.labelNames,
          axisLine: {
            lineStyle: {
              color: '#30665D',
            },
          },
          axisLabel: {
            color: '#B0E1D9',
          },
          axisTick: {
            show: false, // 隐藏刻度线
          },
          boundaryGap: true,
        },
        yAxis: [
          {
            type: 'value',
            name: '诉件数/件',
            min: 0,
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '百分比',
            min: 0,
            max: 100,
            interval: 10,
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              align: 'left',
              padding: [0, 0, 10, 0],
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(110, 112, 121, 0.2)',
              },
            },
            alignTicks: true,
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
        ],
        series: [
          {
            name: '诉件数/件',
            type: 'line',
            data: chartData.value.caseCounts,
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#41b6ab',
            },
            lineStyle: {
              width: 1,
              color: '#41b6ab',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: `rgba(${CASE_COLOR.rgbStr}, 0)`, // Completely transparent at bottom
                },
                {
                  offset: 1,
                  color: `rgba(${CASE_COLOR.rgbStr}, 0.3)`, // Slightly visible at top
                },
              ]),
            },
            label: {
              show: true, // 确保标签总开关是打开的
              position: 'top', // 可以根据需要调整 label 位置
              align: 'center', // 标签居中对齐
              color: '#fff', // 标签文本颜色
              formatter: function (params) {
                // params 包含当前数据项的信息，例如 dataIndex（索引）和 value（数值）
                if (params.dataIndex % 2 === 0) {
                  return params.value; // 显示偶数索引的标签值
                } else {
                  return ''; // 奇数索引返回空字符串，达到隐藏效果
                }
              },
            },
          },
          {
            name: '双是率',
            type: 'line',
            yAxisIndex: 1,
            data: chartData.value.doubleYesRate,
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#f89b29',
            },
            lineStyle: {
              width: 1,
              color: '#f89b29',
            },
            // No areaStyle for the satisfaction rate line
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: `rgba(${YES_PERCENT_COLOR.rgbStr}, 0)`, // Completely transparent at bottom
                },
                {
                  offset: 1,
                  color: `rgba(${YES_PERCENT_COLOR.rgbStr}, 0.3)`, // Slightly visible at top
                },
              ]),
            },
            label: {
              show: true, // 确保标签总开关是打开的
              position: 'top', // 可以根据需要调整 label 位置
              align: 'center', // 标签居中对齐
              color: '#fff', // 标签文本颜色
              formatter: function (params) {
                // params 包含当前数据项的信息，例如 dataIndex（索引）和 value（数值）
                if (params.dataIndex % 2 === 0) {
                  return `${params.value}`; // 显示偶数索引的标签值
                } else {
                  return ''; // 奇数索引返回空字符串，达到隐藏效果
                }
              },
            },
          },
          {
            name: '双否率',
            type: 'line',
            yAxisIndex: 1,
            data: chartData.value.doubleNoRate,
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#E0E0E0',
            },
            lineStyle: {
              width: 1,
              color: '#E0E0E0',
            },
            // No areaStyle for the satisfaction rate line
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: `rgba(${NO_PERCENT_COLOR.rgbStr}, 0)`, // Completely transparent at bottom
                },
                {
                  offset: 1,
                  color: `rgba(${NO_PERCENT_COLOR.rgbStr}, 0.3)`, // Slightly visible at top
                },
              ]),
            },
            label: {
              show: true, // 确保标签总开关是打开的
              position: 'top', // 可以根据需要调整 label 位置
              align: 'center', // 标签居中对齐
              color: '#fff', // 标签文本颜色
              formatter: function (params) {
                // params 包含当前数据项的信息，例如 dataIndex（索引）和 value（数值）
                if (params.dataIndex % 2 === 0) {
                  return `${params.value}`; // 显示偶数索引的标签值
                } else {
                  return ''; // 奇数索引返回空字符串，达到隐藏效果
                }
              },
            },
          },
        ],
      };

      chart.setOption(option);
      // 初始化后立即调整大小
      setTimeout(() => {
        resizeChart();
      }, 0);
    }
  };

  // 添加resize事件处理函数
  const resizeChart = () => {
    if (chart) {
      chart.resize();
    }
  };

  //   上一期
  const onRangePrev = () => {
    console.log('onRangePrev');
    offsetRef.value = offsetRef.value - 1;
    if (rangeTypeRef.value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (rangeTypeRef.value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  // 下一期
  const onRangeNext = () => {
    console.log('onRangeNext');
    offsetRef.value = offsetRef.value + 1;
    if (rangeTypeRef.value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (rangeTypeRef.value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  //   直派、综合
  const onTabChange = (sourceType) => {
    console.log('sourceType', sourceType);
    sourceTypeRef.value = sourceType;
    offsetRef.value = 0;
    fetchData();
  };

  // 期、年
  const onTypeChange = ({ value }) => {
    console.log('onTypeChange', value);
    offsetRef.value = 0;
    rangeTypeRef.value = value;
    if (value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  const fetchData = async () => {
    let parmas: any = {
      sourceType: sourceTypeRef.value,
      rangeType: rangeTypeRef.value,
      startTime: startTimeRef.value,
      endTime: endTimeRef.value,
    };
    try {
      const res: any = await getOrderLineCountList(parmas);
      console.log('res', res);
      if (res && res.length > 1) {
        const newLabelNames: string[] = [];
        const newCaseCounts: number[] = [];
        const newDoubleYesRate: number[] = [];
        const newDoubleNoRate: number[] = [];
        res.forEach((item: any) => {
          newLabelNames.push(item.labelName);
          newCaseCounts.push(item.caseCount);
          newDoubleYesRate.push(item.doubleYes);
          newDoubleNoRate.push(item.doubleNo);
        });
        chartData.value = {
          labelNames: newLabelNames,
          caseCounts: newCaseCounts,
          doubleYesRate: newDoubleYesRate,
          doubleNoRate: newDoubleNoRate,
        };
        console.log(chartData.value);
        initChart();
      }
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const fetchMonthConfig = async () => {
    try {
      const { startTime, endTime }: any = await getTimeCycle({ offset: offsetRef.value });
      startTimeRef.value = startTime;
      endTimeRef.value = endTime;
      fetchData();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const fetchYearConfig = async () => {
    try {
      const { startTime, endTime }: any = await getYearCycle({ offset: offsetRef.value });
      startTimeRef.value = startTime;
      endTimeRef.value = endTime;
      fetchData();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  onMounted(() => {
    fetchMonthConfig();
    // 添加窗口resize事件监听
    window.addEventListener('resize', resizeChart);
    // 监听刷新数据事件
    window.addEventListener('refresh-runtime-data', fetchMonthConfig);
  });

  // 添加组件卸载前的清理
  onBeforeUnmount(() => {
    // 移除事件监听器
    window.removeEventListener('resize', resizeChart);
    window.removeEventListener('refresh-runtime-data', fetchMonthConfig);
    // 销毁图表实例
    if (chart) {
      chart.dispose();
      chart = null;
    }
  });
</script>

<style lang="less" scoped>
  .title {
    width: 100%;
    height: 42px;
    background-image: url(@/assets/images/composite/title-bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10px;

    .title-left {
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
        margin-right: 20px;
      }
    }
    .title-right {
      display: flex;
      align-items: center;
    }
  }
  .chart-container {
    width: 100%;
    height: 100%;
    position: relative;
    padding-top: 12px;
  }
</style>
