<template>
  <div class="main">
    <CaseTypeStatistics :seriesData="seriesData" :xAxisData="xAxisData" />
  </div>
</template>

<script setup>
  import CaseTypeStatistics from './components/CaseTypeStatistics.vue';

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
