<template>
  <div class="chart-container">
    <div ref="chartRef" style="width: 100%; height: 400px"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import blockImage from '@/assets/images/dashboard/block.png';
  import { CASE_COLOR, PERCENT_COLOR, tooltip, calculateDynamicYAxis } from '@/utils/dashboard';

  const chartRef = ref(null);
  let chart = null;

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      // 数据抽离
      const categories = Array.from({ length: 15 }, (_, i) => (i + 1).toString());
      const barData = [173, 117, 125, 103, 40, 124, 173, 117, 115, 103, 172, 124, 125, 103, 172];
      const satisfactionRate = [96, 89, 95, 87, 95, 83, 96, 89, 95, 87, 95, 83, 95, 87, 95]; // 百分比

      const { max, interval } = calculateDynamicYAxis(barData, 10);

      const option = {
        tooltip,
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [
          {
            type: 'category',
            data: categories,
            boundaryGap: true,
            barCategoryGap: '50%',
            axisLine: { lineStyle: { color: '#ccc' } },
            axisTick: {
              show: false, // 隐藏刻度线
            },
            splitLine: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '案件数量/件',
            axisLine: { lineStyle: { color: '#ccc' } },
            splitLine: {
              show: false,
            },
            min: 0,
            max,
            interval,
          },
          {
            type: 'value',
            name: '满意率',
            axisLabel: { formatter: '{value}%' },
            axisLine: { lineStyle: { color: '#ccc' } },
            min: 0,
            max: 100,
            interval: 10,
            splitLine: {
              lineStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
            },
            alignTicks: true,
          },
        ],
        series: [
          {
            name: '案件数量',
            type: 'bar',
            barGap: 0,
            data: barData,
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
                  { offset: 1, color: `rgba(${CASE_COLOR.rgbStr}, 1)` },
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
            name: '满意率',
            type: 'line',
            yAxisIndex: 1,
            data: satisfactionRate,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            max: 100,
            itemStyle: {
              color: PERCENT_COLOR.rgb,
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              color: '#fff',
            },
          },
        ],
      };

      chart.on('mouseout', { dataIndex: 17 }, function () {
        chart.setOption({
          graphic: [],
        });
      });

      chart.setOption(option);

      window.addEventListener('resize', handleResize);
    }
  };

  const handleResize = () => {
    chart && chart.resize();
  };

  onMounted(() => {
    initChart();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chart && chart.dispose();
  });
</script>

<style scoped>
  .chart-container {
    width: 100%;
    border-radius: 4px;
    padding: 10px;
  }
</style>
