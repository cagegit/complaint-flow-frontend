<template>
  <div class="composite-box">
    <Header :index="0" />
    <Title title="综合事态" />
    <div class="composite-block">
      <div class="composite-item">
        <ComplaintStatistics />
      </div>
      <div class="composite-item">
        <DissatisfactionAnalysis />
      </div>
    </div>
    <div class="composite-block">
      <div class="composite-item">
        <ComplaintTypeStatistics />
      </div>
      <div class="composite-item">
        <GroupComplaintStatistics />
      </div>
    </div>
  </div>
</template>
<script setup>
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import ComplaintStatistics from './ComplaintStatistics.vue';
  import DissatisfactionAnalysis from './DissatisfactionAnalysis.vue';
  import ComplaintTypeStatistics from './ComplaintTypeStatistics.vue';
  import GroupComplaintStatistics from './GroupComplaintStatistics.vue';
</script>
<style lang="less" scoped>
  .composite-box {
    width: 100vw;
    height: 100vh;
    min-height: 1080px;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow-y: auto;

    .composite-block {
      padding-left: 22px;
      padding-right: 22px;
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .composite-item {
        width: 928px;
        height: 444px;
        display: flex;
        flex-direction: column;
      }
    }
  }
</style>
