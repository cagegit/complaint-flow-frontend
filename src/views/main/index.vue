<template>
  <div class="main">
    <div class="block">
      <!-- 案件类型统计 -->
      <CaseTypeStatistics :seriesData="seriesData" :xAxisData="xAxisData" />
      <!-- 案件总览 -->
      <CaseSummary :seriesData="summaryData" />
    </div>
    <div class="block">
      <!-- 进度条 -->
      <Progress :percent="20" />
    </div>
    <div class="block">
      <!-- 诉件统计 -->
      <ComplaintStatistics />
      <!-- 不满意分析 -->
      <DissatisfactionAnalysis :seriesData="dissatisfactionData" />
    </div>
    <div class="block">
      <!-- 诉讼类型分析统计 -->
      <ComplaintTypeStatistics />
      <!-- 群诉案件数量和满意率 -->
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
  import { CASE_COLOR, PERCENT_COLOR } from './components/common';
  // 案件类型统计数据
  const seriesData = [
    {
      label: '案件数量/件',
      data: [120, 200, 150, 80, 70, 110, 130],
      color: CASE_COLOR.rgbStr, // 蓝色
      yAxisIndex: 0,
    },
    {
      label: '满意率',
      data: [90, 80, 30, 60, 92, 100, 70],
      color: PERCENT_COLOR.rgbStr, // 橙色
      yAxisIndex: 1,
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
    { value: 68, name: '社会秩序', color: '122,213,23' },
    { value: 59, name: '交通管理', color: '247,112,98' },
    { value: 48, name: '公共安全', color: '126,232,250' },
    { value: 32, name: '公共服务', color: '255,154,158' },
    { value: 22, name: '农村管理', color: '161,140,209' },
    { value: 18, name: '邮政业服务管理', color: '255,206,86' },
    { value: 16, name: '环境保护', color: '75,192,192' },
    { value: 15, name: '市政', color: '153,102,255' },
    { value: 13, name: '市容市貌', color: '255,159,64' },
    { value: 12, name: '城市绿化', color: '54,162,235' },
    { value: 1, name: '城乡建设', color: '201,203,207' },
    { value: 1, name: '供暖', color: '255,99,132' },
    { value: 2, name: '住房', color: '255,205,86' },
    { value: 3, name: '民政事务', color: '75,192,192' },
    { value: 4, name: '妇女权益', color: '153,102,255' },
    { value: 6, name: '卫生健康', color: '255,159,64' },
    { value: 6, name: '劳动和社会保障', color: '54,162,235' },
    { value: 7, name: '企业服务', color: '201,203,207' },
    { value: 8, name: '物业管理', color: '255,99,132' },
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
