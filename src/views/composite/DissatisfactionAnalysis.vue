<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { getCoordinates } from '@/utils/dashboard';

  const dissatisfactionData = [
    { value: 68, name: '社会秩序', color: '122,213,23' },
    { value: 59, name: '交通管理', color: '247,112,98' },
    { value: 48, name: '公共安全', color: '126,232,250' },
    { value: 32, name: '公共服务', color: '255,154,158' },
    { value: 22, name: '农村管理', color: '161,140,209' },
    { value: 18, name: '邮政业服务管理', color: '255,206,86' },
    { value: 16, name: '环境保护', color: '75,192,192' },
    { value: 15, name: '市政', color: '153,102,255' },
    { value: 13, name: '市容市貌', color: '255,159,64' },
    { value: 12, name: '城市绿化', color: '54,162,235' },
    { value: 1, name: '城乡建设', color: '201,203,207' },
    { value: 1, name: '供暖', color: '255,99,132' },
    { value: 2, name: '住房', color: '255,205,86' },
    { value: 3, name: '民政事务', color: '75,192,192' },
    { value: 4, name: '妇女权益', color: '153,102,255' },
    { value: 6, name: '卫生健康', color: '255,159,64' },
    { value: 6, name: '劳动和社会保障', color: '54,162,235' },
    { value: 7, name: '企业服务', color: '201,203,207' },
    { value: 8, name: '物业管理', color: '255,99,132' },
  ];

  const chartRef = ref(null);
  let chartInstance = null;

  const setChartOption = () => {
    if (!chartInstance) return;

    const data = dissatisfactionData.slice();

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
