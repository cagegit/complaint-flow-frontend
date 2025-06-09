<template>
  <div class="title">
    <div class="title-left">
      <div class="text cursor-pointer" @click="toGongDan('1')">群诉件分析</div>
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
  import blockImage from '@/assets/images/dashboard/block.png';
  import { CASE_COLOR, YES_PERCENT_COLOR, NO_PERCENT_COLOR, tooltip, calculateDynamicYAxis, grid, getDayString } from '@/utils/dashboard';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  // 保留导入但添加注释表明暂时未使用
  // eslint-disable-next-line
  import { getQunsuList, getTimeCycle, getYearCycle } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue';
  import { RangeTypeEnum, RomplaintTypeTabs, SourceTypeDefault } from '/@/enums/statisticEnum';
  import TimeSwiper from '@/components/TimeSwiper/index.vue';
  import dayjs from 'dayjs'
  import { useRouter } from 'vue-router';

  const router = useRouter();
  // 控制是否使用模拟数据
  const useMockData = ref(false);

  // 定义数据接口
  interface ChartDataItem {
    caseCount: number;
    doubleYes: number;
    doubleNo: number;
    labelName: string;
  }

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;
  const offsetRef = ref(0); // 偏移量
  const sourceTypeRef = ref(SourceTypeDefault); // 来源类型
  const rangeTypeRef = ref(RangeTypeEnum.MONTH); // 时间周期类型
  const startTimeRef = ref(''); // 时间周期类型
  const endTimeRef = ref(''); // 时间周期类型

  const labelNames = ref<string[]>([]);
  const caseCount = ref<number[]>([]); // 诉件数
  const doubleYesRate = ref<number[]>([]); // 双正
  const doubleNoRate = ref<number[]>([]); // 双负

  // 模拟数据生成函数
  const generateMockData = (count = 6): ChartDataItem[] => {
    const mockData: ChartDataItem[] = [];
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const years = ['2021', '2022', '2023', '2024'];

    for (let i = 0; i < count; i++) {
      mockData.push({
        caseCount: Math.floor(Math.random() * 1000) + 100, // 100-1100 的随机数
        doubleYes: Math.floor(Math.random() * 60) + 20, // 20-80 的随机数
        doubleNo: Math.floor(Math.random() * 40) + 10, // 10-50 的随机数
        labelName:
          rangeTypeRef.value === RangeTypeEnum.MONTH
            ? months[Math.floor(Math.random() * months.length)]
            : years[Math.floor(Math.random() * years.length)],
      });
    }
    return mockData;
  };

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      const { max, interval } = calculateDynamicYAxis(caseCount.value, 10);

      const option = {
        tooltip,
        grid,
        xAxis: [
          {
            type: 'category',
            data: labelNames.value,
            boundaryGap: true,
            barCategoryGap: '50%',
            axisLine: {
              lineStyle: {
                color: '#30665D',
              },
            },
            axisTick: {
              show: false, // 隐藏刻度线
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#B0E1D9',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '诉件数/件',
            axisLine: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            min: 0,
            max,
            interval,
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
            },
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '百分比',
            axisLine: { lineStyle: { color: '#ccc' } },
            min: 0,
            max: 100,
            interval: 10,
            splitLine: {
              lineStyle: {
                color: 'rgba(110, 112, 121, 0.2)',
              },
            },
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
              align: 'left',
            },
            alignTicks: true,
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: '诉件数',
            type: 'bar',
            barGap: 0,
            data: caseCount.value,
            barWidth: 10,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: `rgba(${CASE_COLOR.rgbStr}, 0)` },
                  { offset: 1, color: `rgba(${CASE_COLOR.rgbStr}, 0.7)` },
                ],
              },
            },
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
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'center',
                },
              },
              offset: [0, 6], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双是率',
            type: 'line',
            yAxisIndex: 1,
            data: doubleYesRate.value,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            max: 100,
            itemStyle: {
              color: YES_PERCENT_COLOR.rgb,
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}',
              color: '#fff',
              offset: [0, 4], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双否率',
            type: 'line',
            yAxisIndex: 1,
            data: doubleNoRate.value,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            max: 100,
            itemStyle: {
              color: NO_PERCENT_COLOR.rgb,
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}',
              color: '#fff',
              offset: [0, 4], // 调整标签位置，向上偏移
            },
          },
        ],
      };

      chart.on('mouseout', { dataIndex: 17 }, function () {
        chart?.setOption({
          graphic: [],
        });
      });

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
    // eslint-disable-next-line
    const params = {
      sourceType: sourceTypeRef.value,
      rangeType: rangeTypeRef.value,
      startTime: startTimeRef.value,
      endTime: endTimeRef.value,
    };
    try {
      let res: ChartDataItem[];

      if (useMockData.value) {
        // 使用模拟数据
        res = generateMockData();
      } else {
        // 使用真实接口数据
        res = (await getQunsuList(params)) as ChartDataItem[];
      }

      const newCaseCount: number[] = [];
      const newDoubleYesRate: number[] = [];
      const newDoubleNoRate: number[] = [];
      const newLabelNames: string[] = [];
      res.forEach((item: ChartDataItem) => {
        newCaseCount.push(item.caseCount);
        newDoubleYesRate.push(item.doubleYes);
        newDoubleNoRate.push(item.doubleNo);
        newLabelNames.push(item.labelName);
      });
      labelNames.value = newLabelNames.map(v => dayjs(v).format('MM-DD')); // 格式化为日显示
      caseCount.value = newCaseCount; // 诉件数
      doubleYesRate.value = newDoubleYesRate; // 双是
      doubleNoRate.value = newDoubleNoRate; // 双否
      initChart();
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
     // 跳转到工单页面
  const toGongDan = (tp:string) => {
    if(tp === '1') {
      router.push({ path: '/complaint/manager',
       query: { 
        statusCode: 'complete_done', 
        sourceType: sourceTypeRef.value,
        startTime: startTimeRef.value,
        endTime: endTimeRef.value,
        caseNature: '3', // 群诉件
       } });
    }
  };
</script>

<style scoped lang="less">
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
    position: relative;
    padding-top: 12px;
    width: 100%;
    height: 100%;
  }
</style>
