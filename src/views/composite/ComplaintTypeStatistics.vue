<template>
  <div class="chart-container">
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import blockImage from '@/assets/images/dashboard/block.png';
  import { tooltip, PERCENT_COLOR, CASE_COLOR, grid } from '@/utils/dashboard';

  const chartRef = ref(null);
  let chart = null;

  // Sample data extracted from the image
  const chartData = {
    dateRange: '2024年12月12日——2025年1月11日',
    dates: [],
    caseNumbers: [
      140, 154, 154, 128, 154, 165, 146, 165, 121, 124, 100, 69, 100, 139, 80, 96, 157, 92, 105, 120, 150, 112, 154, 254, 154, 114, 84, 94, 154,
    ],
    satisfactionRates: [98, 92, 92, 93, 94, 86, 82, 93, 91, 87, 99, 96, 98, 92, 100, 99, 92, 99, 99, 98, 81, 38, 54, 52, 100, 56, 89, 32, 54, 87],
  };

  const dateRange = 30;
  Array.from({ length: dateRange }, (_, index) => {
    chartData.dates.push(`${index + 1}`);
  });

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      // 数据抽离
      const categories = Array.from({ length: 15 }, (_, i) => (i + 1).toString());
      const barData = [173, 117, 125, 103, 172, 124, 173, 117, 125, 103, 172, 124, 125, 103, 172];
      const satisfactionRate = [96, 89, 95, 87, 95, 83, 96, 89, 95, 87, 95, 83, 95, 87, 95]; // 百分比

      const maxBarNumber = Math.max(...barData);
      const interval = 40;
      const max = Math.ceil(maxBarNumber / interval) * interval;

      const option = {
        tooltip,
        grid,
        xAxis: [
          {
            type: 'category',
            data: categories,
            axisTick: {
              show: false, // 隐藏刻度线
            },
            axisLine: {
              lineStyle: {
                color: '#30665D',
              },
            },
            axisLabel: {
              color: '#B0E1D9',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '案件数量/件',
            axisLine: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
            },
            min: 0,
            max,
            interval,
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '满意率',
            axisLine: {
              show: false,
            },
            min: 0,
            max: 100,
            splitLine: {
              lineStyle: {
                color: 'rgba(110, 112, 121, 0.2)',
              },
            },
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
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
            name: '案件数量',
            type: 'bar',
            barGap: 0,
            data: barData,
            yAxisIndex: 0,
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
              align: 'right', // 右对齐
              distance: 5,
              formatter: function (params) {
                return `{value|${params.value}}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'right',
                  padding: [0, 2, 4, 0],
                },
                block: {
                  height: 2,
                  width: 12,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'right',
                },
              },
              offset: [5, 6], // 调整标签位置，向上偏移
            },
          },
          {
            name: '满意率',
            type: 'bar',
            data: satisfactionRate,
            yAxisIndex: 1,
            barWidth: 10,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: `rgba(${PERCENT_COLOR.rgbStr}, 0)` },
                  { offset: 1, color: `rgba(${PERCENT_COLOR.rgbStr}, 1)` },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              align: 'left', // 右对齐
              distance: 5,
              formatter: function (params) {
                return `{value|${params.value}%}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'left',
                  padding: [0, 0, 4, 0],
                },
                block: {
                  height: 2,
                  width: 12,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'left',
                },
              },
              offset: [-5, 5], // 调整标签位置，向上偏移
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
    height: 100%;
  }
</style>
