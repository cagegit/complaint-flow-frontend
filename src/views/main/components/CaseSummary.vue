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
        label: { show: false }, // 不显示标签
        tooltip: { show: false }, // 不显示提示
      });
    }

    return result;
  }

  const setChartOption = () => {
    if (!chartInstance) return;
    const calcData = processData(props.seriesData);
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
            show: true,
            position: 'outside',
            formatter: (params) => {
              console.log(params);
              // 根据数据项显示不同label
              let desc = '';
              if (params.name === '满意率') {
                desc = `{title|满意率 ${params.value}%}\n{desc|同比 ↑ ${params.data.persent}%}`;
              } else if (params.name === '不满意率') {
                desc = `{title|不满意率 ${params.value}%}\n{desc|同比 ↓ ${params.data.persent}%}`;
              } else if (params.name === '不合理诉求率') {
                desc = `{title|不合理诉求率 ${params.value}%}\n{desc|同比 ↑ ${params.data.persent}%}`;
              }
              return desc;
            },
            rich: {
              title: {
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                padding: [0, 0, 4, 0],
              },
              desc: {
                color: '#aaa',
                fontSize: 12,
              },
            },
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
          labelLine: {
            show: true,
            smooth: 0.2,
            length: 10,
            length2: 15,
          },
          data: calcData,
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
    background-color: rgb(21, 51, 50);
  }
  .chart {
    width: 100%;
    height: 400px;
  }
</style>
