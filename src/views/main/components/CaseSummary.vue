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

  function processData(data) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const result = [...data];

    if (total < 100) {
      result.push({
        value: 100 - total,
        name: 'Empty',
        itemStyle: {
          color: 'rgba(200, 200, 200, 0.1)', // 透明扇区
        },
        color: '200, 200, 200',
        label: { show: false }, // 不显示标签
        tooltip: { show: false }, // 不显示提示
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

      // Convert to radians for the helper functions
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Create 10 segments with increasing opacity for each color section
      const segmentStart = startRad;
      const segmentEnd = startRad + (endRad - startRad);

      const coords = getCoordinates(segmentStart, segmentEnd);
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
      };
      if (index === data.length - 1) {
        targetSerie = {
          ...targetSerie,
          itemStyle: {
            color: 'rgba(255,25255,255,0.1)',
          },
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
          name: '满意度',
          type: 'pie',
          radius: ['50%', '55%'], // 调细圆环
          startAngle: -90,
          avoidLabelOverlap: false,
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
            rich: {
              name: {
                fontSize: 16,
                padding: [0, 0, 10, 0],
                color: '#fff',
              },
              time: {
                fontSize: 12,
                padding: [6, 0, 0, 0],
                color: '#999',
              },
            },
          },
          labelLine: {
            length: 15,
            length2: 0,
            maxSurfaceAngle: 80,
          },
          labelLayout: function (params) {
            const isLeft = params.labelRect.x < chartInstance.getWidth() / 2;
            const points = params.labelLinePoints;
            points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
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
