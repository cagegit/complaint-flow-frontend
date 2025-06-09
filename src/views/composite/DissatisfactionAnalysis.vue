<template>
  <div class="title">
    <div class="title-left">
      <div class="text cursor-pointer" @click="toGongDan('1')">双否分析</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
  </div>
  <div class="composite-content">
    <TimeSwiper :startTime="getDayString(startTimeRef)" :endTime="getDayString(endTimeRef)" :onPrev="onRangePrev" :onNext="onRangeNext" />
    <img class="composite-bg" src="@/assets/images/composite/group-bg.png" alt="" />
    <div class="chart-container">
      <div ref="chartRef" class="chart" style="width: 100%; height: 100%"></div>
      <div class="total">
        <div class="total-number">{{ total }}</div>
        <div class="total-label">总计</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { getDayString } from '@/utils/dashboard';
  import * as echarts from 'echarts';
  import { getCoordinates } from '@/utils/dashboard';
  import { getDoubleNoList, getTimeCycle, getYearCycle } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { RomplaintTypeTabs, RangeTypeEnum, SourceTypeDefault } from '/@/enums/statisticEnum';
  import TimeSwiper from '@/components/TimeSwiper/index.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  // 控制是否使用模拟数据
  const useMockData = ref(false);

  interface DissatisfactionData {
    caseCount: number;
    labelName: string;
    color: string;
  }

  const colors = [
    '122,213,23',
    '247,112,98',
    '126,232,250',
    '255,154,158',
    '161,140,209',
    '255,206,86',
    '75,192,192',
    '153,102,255',
    '255,159,64',
    '54,162,235',
    '201,203,207',
    '255,99,132',
    '255,205,86',
    '75,192,192',
    '153,102,255',
    '255,159,64',
    '54,162,235',
    '201,203,207',
    '255,99,132',
  ];

  const dissatisfactionData = ref<DissatisfactionData[]>([]);
  const sourceType = ref(SourceTypeDefault);
  const rangeTypeRef = ref(RangeTypeEnum.MONTH);
  const startTimeRef = ref(''); // 时间周期类型
  const endTimeRef = ref(''); // 时间周期类型
  const offsetRef = ref(0); // 偏移量

  const total = ref(0);

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

  let hasListened: boolean = false;

  const setChartOption = () => {
    if (!chart) return;

    // Create series data with gradients
    let startAngle = 0;
    const seriesData: any = [];

    dissatisfactionData.value.forEach((item) => {
      const angle = (item.caseCount / total.value) * 360;
      const endAngle = startAngle + angle;

      // Convert to radians for the helper functions
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Create 10 segments with increasing opacity for each color section
      const segmentStart = startRad;
      const segmentEnd = startRad + (endRad - startRad);

      const coords = getCoordinates(segmentStart, segmentEnd) as {
        x: number;
        y: number;
        x2: number;
        y2: number;
      };
      const startColor = `rgba(${item.color}, 0)`;
      const endColor = `rgba(${item.color}, 1)`;

      const getColorRich = (colorKey, color) => {
        let target = {};
        target[colorKey] = {
          color: `rgb(${color})`,
          padding: [0, 10, 20, 0],
          fontSize: 18,
        };
        return target;
      };

      seriesData.push({
        name: `${item.labelName}`,
        value: item.caseCount,
        color: item.color,
        itemStyle: {
          color: {
            type: 'linear',
            x: coords.x,
            y: coords.y,
            x2: coords.x2,
            y2: coords.y2,
            colorStops: [
              { offset: 0, color: startColor }, // 10% opacity
              { offset: 1, color: endColor }, // Increasing opacity
            ],
          },
        },
        label: {
          alignTo: 'edge',
          formatter: (params: { data: { color: string }; name: any; value: any; percent: any }) => {
            const colorKey = params.data.color.split(',').join('');
            return `{${colorKey}|■} {name|${params.name}} {value|${params.value}} {percent|${params.percent}%}`;
          },
          rich: {
            name: {
              width: 140,
              color: '#E0FCF6',
              fontSize: 16,
              padding: [0, 0, 18, 0],
              align: 'left',
            },
            value: {
              fontSize: 16,
              width: 40,
              padding: [4, 0, 20, 0],
              color: '#E0FCF6',
              align: 'left',
            },
            percent: {
              fontSize: 16,
              padding: [4, 0, 20, 0],
              color: '#E0FCF6',
              fontWeight: 400,
            },
            ...getColorRich(item.color.split(',').join(''), item.color),
          },
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
        },
      });

      startAngle = endAngle;
    });

    // ECharts option
    const option = {
      series: [
        {
          type: 'pie',
          radius: ['45%', '51%'],
          center: ['50%', '50%'],
          startAngle: 90,
          data: seriesData,
          silent: true,
          labelLine: {
            length: 15,
            length2: 0,
            maxSurfaceAngle: 80,
            lineStyle: {
              color: 'rgba(72, 255, 210, 0.30)',
            },
          },
          labelLayout: function (params) {
            const isLeft = params.labelRect.x < (chart as echarts.EChartsType).getWidth() / 2;
            const points = params.labelLinePoints;
            points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
            return {
              labelLinePoints: points,
            };
          },
        },
      ],
    };

    chart.setOption(option);
  };

  const initChart = () => {
    chart = echarts.init(chartRef.value);
    setChartOption();
    if(chart && !hasListened) {
      hasListened = true;
      chart.on('click','series.label', (params) => {
        console.log('Clicked on:', params);
        // 跳转到工单页面}
      });
    }
    // 初始化后立即调整大小
    setTimeout(() => {
      resizeChart();
    }, 0);
  };

  // 添加resize事件处理函数
  const resizeChart = () => {
    if (chart) {
      chart.resize();
    }
  };

  const onTabChange = (value) => {
    console.log('sourceType', sourceType);
    sourceType.value = value;
    fetchData();
  };

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

  // 生成模拟数据
  const generateMockData = (): DissatisfactionData[] => {
    const mockData: DissatisfactionData[] = [];
    // 创建足够多的类别，与颜色数组长度相匹配
    const categories = [
      '产品质量',
      '服务态度',
      '价格问题',
      '售后服务',
      '物流配送',
      '商品描述',
      '退款问题',
      '发票问题',
      '包装问题',
      '商品破损',
      '延迟发货',
      '客服响应慢',
      '退换货难',
      '虚假宣传',
      '质保问题',
      '系统故障',
      '账户问题',
      '支付问题',
      '优惠券问题',
    ];

    // 确保类别数量与颜色数组长度一致
    const selectedCategories = categories.slice(0, colors.length);

    // 为每个类别生成随机数据
    selectedCategories.forEach((category, index) => {
      mockData.push({
        caseCount: Math.floor(Math.random() * 100) + 10, // 10-110的随机数
        labelName: category,
        color: colors[index],
      });
    });

    return mockData;
  };

  const fetchData = async () => {
    let parmas: any = {
      rangeType: rangeTypeRef.value,
      sourceType: sourceType.value,
      startTime: startTimeRef.value,
      endTime: endTimeRef.value,
    };
    try {
      let res: any;

      if (useMockData.value) {
        // 使用模拟数据
        res = generateMockData();
      } else {
        // 使用真实接口数据
        res = await getDoubleNoList(parmas);
      }

      const nowTotal = res.reduce((acc, item) => acc + item.caseCount, 0);
      total.value = nowTotal;
      dissatisfactionData.value = res.map((item, index) => ({
        caseCount: item.caseCount,
        labelName: item.labelName,
        color: colors[index % colors.length],
      }));
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
  // 跳转到工单页面
  const toGongDan = (tp:string) => {
    if(tp === '1') {
      router.push({ path: '/complaint/manager',
       query: { 
        statusCode: 'complete_done', 
        sourceType: sourceType.value,
        // importTime: [ startTimeRef.value, endTimeRef.value].join('|'),
        startTime: startTimeRef.value,
        endTime: endTimeRef.value,
        caseType: '1'
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

  .composite-content {
    position: relative;
    flex: 1;
    padding-top: 10px;
    box-sizing: border-box;

    .composite-bg {
      position: absolute;
      width: 356px;
      height: 356px;
      left: 50%;
      top: 51%;
      transform: translate(-50%, -50%);
    }
  }

  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .total {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;
      top: 50%; // 垂直居中，根据实际情况调整值
      left: 50%; // 水平居中，根据实际情况调整值
      transform: translate(-50%, -50%); // 居中偏移，根据实际情况调整值

      .total-number {
        font-weight: bold;
        font-size: 32px;
        color: #ffffff;
        line-height: 40px;
        text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
        text-align: left;
        background: linear-gradient(180deg, #ffffff 0%, #ffffff 80%, #57debd 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
        margin-bottom: 5px;
      }
      .total-label {
        font-weight: 500;
        font-size: 14px;
        color: rgba(228, 255, 249, 1);
      }
    }
  }
</style>
