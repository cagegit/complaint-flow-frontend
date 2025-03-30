<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { getCoordinates } from './common';

  const props = defineProps({
    seriesData: {
      type: Array,
      required: true,
    },
  });

  const chartRef = ref(null);
  let chartInstance = null;

  const setChartOption = () => {
    if (!chartInstance) return;

    const data = props.seriesData;

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Create series data with gradients
    const seriesData = [];
    let startAngle = 0;

    data.forEach((item, index) => {
      const angle = (item.value / total) * 360;
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

      seriesData.push({
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
      });

      startAngle = endAngle;
    });

    // ECharts option
    const option = {
      series: [
        {
          type: 'pie',
          radius: ['40%', '50%'],
          center: ['50%', '50%'],
          startAngle: 90,
          data: seriesData,
          silent: true,
          label: {
            alignTo: 'edge',
            formatter: '{colorTag|■} {name|{b}} {value|{c}} {percent|{d}%}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
            rich: {
              colorTag: {
                width: 30,
                fontSize: 16,
                padding: [0, 0, 18, 0],
                color: '#fff',
              },
              name: {
                width: 150,
                fontSize: 16,
                padding: [0, 0, 18, 0],
                color: '#fff',
                align: 'left',
              },
              value: {
                fontSize: 14,
                width: 30,
                padding: [4, 0, 20, 0],
                color: '#fff',
                align: 'left',
              },
              percent: {
                fontSize: 14,
                padding: [4, 0, 20, 0],
                color: '#fff',
              },
            },
          },
          labelLine: {
            length: 15,
            length2: 0,
            maxSurfaceAngle: 80,
            lineStyle: {
              color: '#7aa39e',
            },
          },
          labelLayout: function (params) {
            const isLeft = params.labelRect.x < chartInstance.getWidth() / 2;
            const points = params.labelLinePoints;
            points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
            return {
              labelLinePoints: points,
            };
          },
        },
      ],
    };

    chartInstance.setOption(option);
  };

  const initChart = () => {
    chartInstance = echarts.init(chartRef.value);
    setChartOption();
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
        setChartOption();
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
  }
  .chart {
    width: 100%;
    height: 400px;
  }
</style>
