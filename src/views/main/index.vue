<template>
  <div class="main">
    <CaseTypeStatistics :seriesData="seriesData" :xAxisData="xAxisData" />
    <CaseSummary :seriesData="summaryData"></CaseSummary>
  </div>
</template>

<script setup>
  import CaseTypeStatistics from './components/CaseTypeStatistics.vue';
  import CaseSummary from './components/CaseSummary.vue';
  import * as echarts from 'echarts';

  // 案件类型统计数据
  const seriesData = [
    {
      label: '销量A',
      data: [120, 200, 150, 80, 70, 110, 130],
      color: '55, 162, 255', // 蓝色
      yAxisIndex: 0,
      labelFomatter: '{c}',
    },
    {
      label: '销量B',
      data: [90, 80, 30, 60, 92, 100, 70],
      color: '255, 159, 64', // 橙色
      yAxisIndex: 1,
      labelFomatter: '{c}%',
    },
  ];
  const xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // 案件总结数据
  const summaryData = [
    {
      value: 10,
      name: '满意率',
      itemStyle: {
        // color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
        //   { offset: 0, color: 'rgba(255, 99, 132, 0)' }, // 透明
        //   { offset: 1, color: 'rgba(255, 99, 132, 1)' }, // 不透明
        // ]),
        color: 'rgba(255, 99, 132, 1)',
      },
      persent: 3.5,
    },
    {
      value: 5,
      name: '不满意率',
      itemStyle: {
        // color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
        //   { offset: 0, color: 'rgba(255, 206, 86, 0)' },
        //   { offset: 1, color: 'rgba(255, 206, 86, 1)' },
        // ]),
        color: 'rgba(255, 206, 86, 1)',
      },
      persent: 6,
    },
    {
      value: 11,
      name: '不合理诉求率',
      itemStyle: {
        // color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
        //   { offset: 0, color: 'rgba(153, 102, 255, 0)' },
        //   { offset: 1, color: 'rgba(153, 102, 255, 1)' },
        // ]),
        color: 'rgba(153, 102, 255, 1)',
      },
      persent: 15,
    },
  ];
</script>

<style lang="less">
  .main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(21, 51, 50);
  }
</style>
