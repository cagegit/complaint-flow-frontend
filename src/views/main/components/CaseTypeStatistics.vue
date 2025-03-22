<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';

  const props = defineProps({
    seriesData: {
      type: Array,
      required: true,
    },
    xAxisData: {
      type: Array,
      required: true,
    },
  });

  const chartRef = ref(null);
  let chartInstance = null;

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
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        data: props.xAxisData,
        axisTick: {
          alignWithLabel: true,
        },
        boundaryGap: true,
        axisLabel: {
          color: '#fff',
        },
        axisLine: {
          lineStyle: {
            color: '#fff',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: props.seriesData.find((s) => s.yAxisIndex === 0)?.label || '',
          nameTextStyle: {
            color: '#fff',
          },
          position: 'left',
          max: function (value) {
            return Math.ceil(value.max * 1.2);
          },
          axisLabel: {
            color: '#fff',
          },
          splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.6)' } },
        },
        {
          type: 'value',
          name: props.seriesData.find((s) => s.yAxisIndex === 1)?.label || '',
          nameTextStyle: {
            color: '#fff',
          },
          position: 'right',
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            color: '#fff',
          },
          splitLine: { show: false },
        },
      ],
      series: props.seriesData.map((s) => ({
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
          fontSize: 12,
          formatter: s.labelFomatter,
        },
        itemStyle: {
          color: {
            type: 'pattern',
            image: createPattern(`rgba(${s.color},1)`),
            repeat: 'repeat',
          },
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     { offset: 0, color: `rgba(${s.color},1)` },
          //     { offset: 1, color: `rgba(${s.color},0.1)` },
          //   ]),
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
