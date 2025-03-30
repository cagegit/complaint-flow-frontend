<template>
  <div class="runtime-box">
    <Header :index="1" />
    <Title title="运行事态" />
    <div class="content">
      <div class="left">
        <CaseOverview />
        <SatisfactionRanking />
      </div>
      <div class="center">
        <CaseCarousel />
        <div class="case-type-chart">
          <CaseTypeStatistics />
        </div>
      </div>
      <div class="right">
        <CaseTypeCategory />
      </div>
    </div>
  </div>
</template>
<script setup>
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import CaseOverview from './CaseOverview.vue';
  import SatisfactionRanking from './SatisfactionRanking.vue';
  import CaseCarousel from './CaseCarousel.vue';
  import CaseTypeStatistics from './CaseTypeStatistics.vue';
  import CaseTypeCategory from './CaseTypeCategory.vue';
</script>
<style lang="less" scoped>
  .runtime-box {
    width: 100vw;
    min-height: 100vh;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .content {
      flex: 1;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      overflow: hidden;
      padding: 6px 24px;
      box-sizing: border-box;
      .left {
        width: 446px;
        height: 100%;
      }

      .center {
        width: 932px;
        height: 100%;
        display: flex;
        flex-direction: column;
        .case-type-chart {
          flex: 1;
          width: 100%;
        }
      }

      .right {
        width: 446px;
        height: 100%;
      }
    }
  }
</style>
