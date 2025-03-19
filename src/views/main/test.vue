<template>
  <div ref="chartRef" style="width: 600px; height: 400px"></div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';

  /**
   * 创建一个由小蓝色方块（2x2px）构成的 pattern 填充
   * 在一个 10x10 的 canvas 瓷砖上，在左上角绘制一个 2x2 的蓝色方块
   * 这样重复后就形成了断续的小方块填充效果
   */
  const createSquarePattern = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    // 清空画布（默认透明背景）
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 设置填充颜色为蓝色
    ctx.fillStyle = '#5470C6';
    // 绘制一个 2x2 的方块，位置可根据需要调整（例如左上角）
    ctx.fillRect(0, 0, 2, 2);
    return canvas;
  };

  const chartRef = ref(null);
  let chartInstance = null;

  const initChart = () => {
    chartInstance = echarts.init(chartRef.value);

    const option = {
      title: {
        text: '方格填充柱状图',
      },
      tooltip: {},
      xAxis: {
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true,
        },
        boundaryGap: true,
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [120, 200, 150, 80, 70, 110, 130],
          itemStyle: {
            // 使用 pattern 填充，实现内部断续的方格效果
            color: {
              type: 'pattern',
              image: createSquarePattern(),
              repeat: 'repeat',
            },
            // 同时设置边框为虚线，可选
            borderColor: '#5470C6',
            borderWidth: 2,
          },
        },
      ],
    };

    chartInstance.setOption(option);
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
