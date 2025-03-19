<template>
  <div ref="chartRef" style="width: 600px; height: 400px"></div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';

  const chartRef = ref(null);
  let chartInstance = null;

  // 数据定义
  const data = [
    { name: 'A', value1: 120, value2: 45 },
    { name: 'B', value1: 200, value2: 90 },
    { name: 'C', value1: 150, value2: 60 },
    { name: 'D', value1: 80, value2: 30 },
    { name: 'E', value1: 380, value2: 75 },
  ];

  const MAX_FIXED_BLOCKS = 60;

  const getGapOrBlock = ({ direction, isGap, dataIndex, i, numBlocks }) => {
    const opacity = 0.1 + i / (numBlocks - 1);
    const { length } = data;
    const blockGap = 2; // 每个小方块的间隔为5px
    const name = isGap ? 'gap' : 'block';
    const isLeft = direction === 'left';
    const directionName = isLeft ? 'left' : 'right';
    const barColor = isLeft ? `rgba(55, 162, 255, ${opacity})` : `rgba(255, 107, 59, ${opacity})`;
    const color = isGap ? 'rgba(0, 0, 0, 0)' : barColor;
    return {
      name: `${directionName}-${name}-${dataIndex}-${i}`,
      type: 'bar',
      yAxisIndex: isLeft ? 0 : 1, // 使用右侧Y轴
      stack: `stack-${directionName}-${dataIndex}`,
      silent: true,
      barGap: '-50%',
      barWidth: 10,
      data: Array(length)
        .fill(0)
        .map((_, idx) => {
          // 只在对应的数据项位置放置间隙
          if (idx === dataIndex) {
            return blockGap;
          }
          return '-';
        }),
      itemStyle: {
        color, // 透明色
        borderRadius: 0,
      },
      z: 2,
    };
  };

  const getLabel = ({ direction, value, dataIndex }) => {
    const directionName = direction === 'left' ? 'left' : 'right';
    return {
      name: `${directionName}-label-${dataIndex}`,
      type: 'bar',
      stack: `stack-${directionName}-${dataIndex}`,
      silent: true,
      data: Array(data.length)
        .fill(0)
        .map((_, idx) => {
          // 只在对应的数据项位置放置标签
          if (idx === dataIndex) {
            return {
              value: 0,
              label: {
                show: true,
                position: 'top',
                formatter: `{a|${value}}`,
                rich: {
                  a: {
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    padding: [2, 5],
                    color: '#000',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    shadowBlur: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
            };
          }
          return '-';
        }),
      itemStyle: {
        color: 'rgba(0, 0, 0, 0)', // 透明色
        borderRadius: 0,
      },
      z: 10,
    };
  };

  const initChart = () => {
    chartInstance = echarts.init(chartRef.value);

    // 计算柱状图的方块数量和高度
    const series = [];
    const maxValue1 = Math.max(...data.map((item) => item.value1));
    const maxValue2 = 100;

    // 左侧Y轴柱状图 - 为每个数据项创建堆叠的小方块
    data.forEach((dataItem, dataIndex) => {
      // 计算该数据项需要多少个小方块
      const numBlocks = Math.floor(dataItem.value1 / (maxValue1 / MAX_FIXED_BLOCKS));
      // 为每个数据项创建一个堆叠系列
      for (let i = 0; i < numBlocks; i++) {
        // 创建一个代表单个方块的系列
        const leftBlock = getGapOrBlock({ direction: 'left', isGap: false, dataIndex, i, numBlocks });
        series.push(leftBlock);

        // 创建一个代表间隙的系列
        if (i < numBlocks - 1) {
          const leftGap = getGapOrBlock({ direction: 'left', isGap: true, dataIndex, i, numBlocks });
          series.push(leftGap);
        }
      }

      // 添加左侧柱状图标签
      const leftLabel = getLabel({ direction: 'left', value: dataItem.value1, dataIndex });
      series.push(leftLabel);
    });

    // 右侧Y轴柱状图 - 使用相同的堆叠方块效果
    data.forEach((dataItem, dataIndex) => {
      // 计算该数据项需要多少个小方块
      const numBlocks = Math.floor(dataItem.value2 / (maxValue2 / MAX_FIXED_BLOCKS));

      // 为每个数据项创建一个堆叠系列
      for (let i = 0; i < numBlocks; i++) {
        // 创建一个代表单个方块的系列
        const rightBlock = getGapOrBlock({ direction: 'right', isGap: false, dataIndex, i, numBlocks });
        series.push(rightBlock);

        // 创建一个代表间隙的系列
        if (i < numBlocks - 1) {
          const rightGap = getGapOrBlock({ direction: 'right', isGap: true, dataIndex, i, numBlocks });
          series.push(rightGap);
        }
      }

      // 添加右侧柱状图标签
      const rightLabel = getLabel({ direction: 'right', value: dataItem.value2, dataIndex });
      series.push(rightLabel);
    });

    // 图表配置
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params) {
          // 获取当前hover的数据索引
          let dataIndex = -1;
          for (let i = 0; i < params.length; i++) {
            if (params[i].seriesName.includes('block-')) {
              const parts = params[i].seriesName.split('-');
              dataIndex = parseInt(parts[2]);
              break;
            }
          }

          if (dataIndex >= 0) {
            return `${data[dataIndex].name}<br/>左侧数据: ${data[dataIndex].value1}<br/>右侧数据: ${data[dataIndex].value2}`;
          }
          return '';
        },
      },
      legend: {
        data: ['左侧数据', '右侧数据'],
        top: '5%',
        selected: {
          左侧数据: true,
          右侧数据: true,
        },
      },
      grid: {
        top: '15%',
        right: '10%',
        bottom: '15%',
        left: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.name),
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '左侧数据',
          nameTextStyle: {
            color: '#666',
          },
          max: function (value) {
            // 计算Y轴最大值，确保柱状图能显示完整
            return value.max;
          },
          axisLabel: {
            formatter: '{value}',
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD',
            },
          },
        },
        {
          type: 'value',
          name: '右侧数据',
          nameTextStyle: {
            color: '#666',
          },
          position: 'right',
          max: 100,
          axisLabel: {
            formatter: '{value}',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: series,
    };

    console.log('option', option);

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
