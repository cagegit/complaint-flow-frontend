<template>
  <div class="chart-container">
    <div class="chart-bg"></div>
    <div class="chart-number">
      <div class="number">{{ chartNumber }}</div>
      <div class="unit">%</div>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { getCoordinates } from '@/utils/dashboard';
  import upIcon from '@/assets/images/runtime/category/up-icon.png';
  import downIcon from '@/assets/images/runtime/category/down-icon.png';

  // 控制是否使用模拟数据
  const useMockData = ref(false);

  const props = defineProps({
    seriesData: {
      type: Array,
      required: true,
    },
  });

  const chartRef = ref(null);
  const chartNumber = ref(0);
  let chartInstance = null;
  let isNo100 = ref(false);

  // 生成模拟数据
  const generateMockData = () => {
    const categories = ['直派案件', '综合案件', '一般案件', '特殊案件'];
    const colors = ['96, 240, 187', '255, 133, 71', '126, 232, 250', '255, 206, 86'];

    return categories.map((name, index) => {
      const value = Math.floor(Math.random() * 30) + 5; // 5-35的随机数
      const rate = Math.floor(Math.random() * 40) - 20; // -20到+20的同比率

      return {
        name,
        value,
        color: colors[index % colors.length],
        rate,
      };
    });
  };

  function processData(data) {
    // 如果启用了mock且没有真实数据，使用模拟数据
    const processedData = useMockData.value ? generateMockData() : [...data];

    const total = processedData.reduce((sum, item) => sum + item.value, 0);
    const result = [...processedData];

    chartNumber.value = total > 100 ? 100 : total;

    console.log('total', total, 'result', result);

    isNo100.value = total < 100;
    if (total < 100) {
      result.push({
        value: 100 - total,
        name: 'Empty',
        itemStyle: {
          color: 'rgba(200, 200, 200, 0.1)', // 透明扇区
        },
        color: '200, 200, 200',
        label: { show: false }, // 不显示标签
        // 这里不想hover时提示
        hoverAnimation: false,
      });
    }

    return result;
  }

  const setChartOption = () => {
    if (!chartInstance) return;
    console.log('setChartOption', chartRef.value);
    const data = processData(props.seriesData);
    const series = [];
    let startAngle = 180;
    // 已经按100补齐
    const total = 100;
    data.forEach((item, index) => {
      const angle = (item.value / total) * 360;
      const endAngle = startAngle + angle;
      console.log('angle', startAngle, angle);

      // Convert to radians for the helper functions
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Create 10 segments with increasing opacity for each color section
      const segmentStart = startRad;
      const segmentEnd = startRad + (endRad - startRad);

      const coords = getCoordinates(segmentStart, segmentEnd);
      console.log('coords', coords);
      const startColor = `rgba(${item.color}, 0)`;
      const endColor = `rgba(${item.color}, 1)`;

      let targetSerie = {
        name: `${item.name}`,
        value: item.value,
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
        labelLine: {
          length: 20,
          length2: 0,
          maxSurfaceAngle: 80,
          lineStyle: {
            color: `rgba(${item.color}, 0.6)`, // 白色
          },
        },
        rate: item.rate,
      };
      if (isNo100.value && index === data.length - 1) {
        targetSerie = {
          ...targetSerie,
          itemStyle: {
            color: 'rgba(255,255,255,0)',
          },
          label: {
            show: false,
          },
          tooltip: { show: false }, // 不显示提示
        };
      }
      series.push(targetSerie);

      startAngle = endAngle;
    });

    const option = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: ['68%', '75%'], // 调细圆环
          startAngle: -90,
          avoidLabelOverlap: true,
          emphasis: { disabled: true },
          itemStyle: {
            borderColor: 'transparent',
          },
          label: {
            alignTo: 'edge',
            formatter: '{name|{b}}\n{time|{c} 小时}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
            formatter: (params) => {
              // console.log('params', params);
              const rate = params.data.rate || 0;
              return `{name|${params.name}} {percent|${params.percent}} {unit|%} \n {rate|同比} {${rate > 0 ? 'rateUp|' : rate == 0 ? 'zero|' : 'rateDown|'}} {rate|${rate}%}`;
            },
            rich: {
              name: {
                fontSize: 14,
                padding: [0, 0, 10, 0],
                color: '#fff',
              },
              percent: {
                fontSize: 20,
                padding: [0, 0, 12, 6],
                color: '#fff',
              },
              unit: { fontSize: 12, color: '#E4FFF9' },
              rate: {
                fontSize: 12,
                padding: [6, 0, 0, 0],
                color: '#E4FFF9',
              },
              rateUp: {
                width: 9,
                height: 11,
                backgroundColor: {
                  image: upIcon,
                },
              },
              rateDown: {
                width: 9,
                height: 11,
                backgroundColor: {
                  image: downIcon,
                },
              },
              zero: {},
            },
          },
          labelLayout: function (params) {
            const isLeft = params.labelRect.x < chartInstance.getWidth() / 2;
            const points = params.labelLinePoints;
            if (points && points[2]) {
              points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
            }
            return {
              labelLinePoints: points,
            };
          },
          title: {
            text: '100%',
            left: 'center',
            top: 'center',
            textStyle: {
              color: '#fff',
              fontSize: 28,
              fontWeight: 'bold',
            },
          },
          data: series,
        },
      ],
    };

    chartInstance.setOption(option);
  };

  const initChart = () => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    chartInstance = echarts.init(chartRef.value);
    setChartOption();
    // 初始化后立即调整大小
    setTimeout(() => {
      resizeChart();
    }, 0);
  };

  onMounted(() => {
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
    () => [props.seriesData, props.xAxisData],
    () => {
      nextTick(() => {
        initChart();
      });
    },
    { deep: true }
  );

  const resizeChart = () => {
    chartInstance && chartInstance.resize();
  };
</script>

<style scoped lang="less">
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 10px 0;
    box-sizing: border-box;
    .chart-bg {
      position: absolute;
      width: 203px;
      height: 202px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background-image: url(@/assets/images/runtime/overview/chart-bg.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    .chart-number {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;

      .number {
        font-family: SourceHanSansCN, SourceHanSansCN;
        font-weight: bold;
        font-size: 32px;
        text-align: left;
        font-style: normal;
        background: linear-gradient(180deg, #ffffff 0%, #ffffff 30%, #57debd 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
        text-shadow: 0px 0px 11px rgba(144, 255, 235, 0.73);
      }
      .unit {
        font-family: SourceHanSansCN, SourceHanSansCN;
        font-weight: 400;
        font-size: 16px;
        color: #bbffef;
      }
    }
    .chart {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
    }
  }
</style>
