<template>
  <div class="chart-container">
    <div ref="chartRef" style="width: 100%; height: 400px"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import { tooltip, CASE_COLOR, PERCENT_COLOR } from './common';

  const chartRef = ref(null);
  let chart = null;

  // Sample data extracted from the image
  const chartData = {
    dateRange: '2024年12月12日——2025年1月11日',
    dates: [],
    caseNumbers: [
      140, 154, 154, 128, 154, 165, 146, 165, 121, 124, 100, 69, 100, 139, 80, 96, 157, 92, 105, 120, 150, 112, 154, 254, 154, 114, 84, 94, 154, 151,
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

      const option = {
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        title: {
          show: false,
        },
        // 浮窗
        tooltip: {
          ...tooltip,
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#6e7079',
              type: 'solid',
            },
          },
        },
        legend: {
          show: false,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: chartData.dates,
          axisLine: {
            lineStyle: {
              color: '#6e7079',
            },
          },
          axisLabel: {
            color: '#fff',
          },
          axisTick: {
            show: false, // 隐藏刻度线
          },
          boundaryGap: true,
        },
        yAxis: [
          {
            type: 'value',
            name: '案件数量/件',
            min: 0,
            nameTextStyle: {
              color: '#fff',
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(110, 112, 121, 0.2)',
              },
            },
            axisLabel: {
              color: '#fff',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '满意度',
            min: 0,
            max: 100,
            interval: 10,
            nameTextStyle: {
              color: '#fff',
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
            },
            alignTicks: true,
            axisLabel: {
              color: '#fff',
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: '案件数量/件',
            type: 'line',
            data: chartData.caseNumbers,
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#41b6ab',
            },
            lineStyle: {
              width: 1,
              color: '#41b6ab',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: `rgba(${CASE_COLOR.rgbStr}, 0)`, // Completely transparent at bottom
                },
                {
                  offset: 1,
                  color: `rgba(${CASE_COLOR.rgbStr}, 0.3)`, // Slightly visible at top
                },
              ]),
            },
            label: {
              show: true, // 确保标签总开关是打开的
              position: 'top', // 可以根据需要调整 label 位置
              align: 'center', // 标签居中对齐
              color: '#fff', // 标签文本颜色
              formatter: function (params) {
                // params 包含当前数据项的信息，例如 dataIndex（索引）和 value（数值）
                if (params.dataIndex % 2 === 0) {
                  return params.value; // 显示偶数索引的标签值
                } else {
                  return ''; // 奇数索引返回空字符串，达到隐藏效果
                }
              },
            },
          },
          {
            name: '满意度',
            type: 'line',
            yAxisIndex: 1,
            data: chartData.satisfactionRates,
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#f89b29',
            },
            lineStyle: {
              width: 1,
              color: '#f89b29',
            },
            // No areaStyle for the satisfaction rate line
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: `rgba(${PERCENT_COLOR.rgbStr}, 0)`, // Completely transparent at bottom
                },
                {
                  offset: 1,
                  color: `rgba(${PERCENT_COLOR.rgbStr}, 0.3)`, // Slightly visible at top
                },
              ]),
            },
            label: {
              show: true, // 确保标签总开关是打开的
              position: 'top', // 可以根据需要调整 label 位置
              align: 'center', // 标签居中对齐
              color: '#fff', // 标签文本颜色
              formatter: function (params) {
                // params 包含当前数据项的信息，例如 dataIndex（索引）和 value（数值）
                if (params.dataIndex % 2 === 0) {
                  return `${params.value}%`; // 显示偶数索引的标签值
                } else {
                  return ''; // 奇数索引返回空字符串，达到隐藏效果
                }
              },
            },
          },
        ],
      };

      // Display special tooltip for a specific data point (day 18)
      chart.on('mouseover', { dataIndex: 17 }, function () {
        chart.setOption({
          graphic: [
            {
              type: 'rect',
              id: 'tooltip-box',
              z: 100,
              left: 'center',
              top: 'middle',
              shape: {
                width: 180,
                height: 100,
                r: 5,
              },
              style: {
                fill: 'rgba(0,22,41,0.8)',
                stroke: '#41b6ab',
                lineWidth: 2,
                shadowBlur: 8,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowOffsetX: 3,
                shadowOffsetY: 3,
              },
            },
            {
              type: 'text',
              z: 100,
              left: 'center',
              top: 'middle',
              style: {
                text: '2024-12-18\n\n• 案件数量  139\n\n• 满意度     96%',
                fill: '#fff',
                font: '14px Arial',
              },
            },
          ],
        });
      });

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
