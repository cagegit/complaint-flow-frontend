<template>
  <div class="title">
    <div class="title-left">
      <div class="text">双否分析</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
  </div>
  <div class="composite-content">
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
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { getCoordinates } from '@/utils/dashboard';
  import { getDoubleNoList } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { RomplaintTypeTabs, SourceTypeEnum, RangeTypeEnum } from '/@/enums/statisticEnum';

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
  const sourceType = ref(SourceTypeEnum.DIRECT);
  const rangeType = ref(RangeTypeEnum.MONTH);

  const total = ref(0);

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

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

      const coords = getCoordinates(segmentStart, segmentEnd);
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
  };

  const onTabChange = (value) => {
    console.log('sourceType', sourceType);
    sourceType.value = value;
    fetchData();
  };

  const onTypeChange = ({ value }) => {
    console.log('onTypeChange', value);
    rangeType.value = value;
    fetchData();
  };

  const fetchData = async () => {
    let parmas: any = {
      rangeType: rangeType.value,
      sourceType: sourceType.value,
    };
    try {
      const res: any = await getDoubleNoList(parmas);
      const nowTotal = res.reduce((acc, item) => acc + item.caseCount, 0);
      total.value = nowTotal;
      dissatisfactionData.value = res.map((item, index) => ({
        caseCount: item.caseCount,
        labelName: item.labelName,
        color: colors[index],
      }));
      initChart();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  onMounted(() => {
    fetchData();
  });
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
      top: 50%;
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
