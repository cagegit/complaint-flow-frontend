<template>
  <div class="main">
    <div class="block">
      <CaseTypeStatistics :seriesData="seriesData" :xAxisData="xAxisData" />
      <CaseSummary :seriesData="summaryData" />
    </div>
    <div class="block">
      <Progress :percent="20" />
    </div>
    <div class="block">
      <ComplaintStatistics />
      <DissatisfactionAnalysis :seriesData="dissatisfactionData" />
    </div>
    <div class="block">
      <ComplaintTypeStatistics />
      <GroupComplaintStatistics />
    </div>
  </div>
</template>

<script setup>
  import CaseTypeStatistics from './components/CaseTypeStatistics.vue';
  import CaseSummary from './components/CaseSummary.vue';
  import Progress from './components/Progress.vue';
  import DissatisfactionAnalysis from './components/DissatisfactionAnalysis.vue';
  import ComplaintStatistics from './components/ComplaintStatistics.vue';
  import ComplaintTypeStatistics from './components/ComplaintTypeStatistics.vue';
  import GroupComplaintStatistics from './components/GroupComplaintStatistics.vue';
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
      persent: 3.5,
      color: '255, 99, 132',
    },
    {
      value: 5,
      name: '不满意率',
      persent: 6,
      color: '255, 206, 86',
    },
    {
      value: 20,
      name: '不合理诉求率',
      persent: 15,
      color: '153, 102, 255',
    },
    {
      value: 65,
      name: '111',
      persent: 15,
      color: '153, 1, 255',
    },
  ];

  //   不满意分析
  const dissatisfactionData = [
    { value: 4, name: 'Segment 1', color: '122,213,23' }, // Blue
    { value: 15, name: 'Segment 2', color: '247,112,98' }, // Teal
    { value: 10, name: 'Segment 3', color: '126,232,250' }, // Gold
    { value: 15, name: 'Segment 4', color: '255,154,158' }, // Purple
    { value: 20, name: 'Segment 4', color: '161,140,209' }, // Purple
  ];
</script>

<style lang="less">
  .main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgb(21, 51, 50);

    .block {
      width: 100%;
      height: 400px;
      display: flex;
      align-items: center;
    }
  }
</style>
