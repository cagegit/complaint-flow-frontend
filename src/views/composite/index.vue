<template>
  <div class="composite-box">
    <Header :index="0" />
    <Title title="综合事态" />
    <div class="composite-block">
      <div class="composite-item">
        <div class="title">
          <div class="text">诉件统计</div>
          <div>
            <LabelBox />
          </div>
          <!-- <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" /> -->
        </div>
        <ComplaintStatistics />
      </div>
      <div class="composite-item">
        <div class="title">
          <div class="text">不满意分析</div>
          <LabelBox />
          <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
        </div>
        <DissatisfactionAnalysis />
      </div>
    </div>
    <div class="composite-block">
      <div class="composite-item">
        <div class="title">
          <div class="text">诉讼类型分析统计</div>
          <LabelBox />
          <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
        </div>
        <ComplaintTypeStatistics />
      </div>
      <div class="composite-item">
        <div class="title">
          <div class="text">群诉案件数量和满意率</div>
          <LabelBox />
          <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
        </div>
        <GroupComplaintStatistics />
      </div>
    </div>
  </div>
</template>
<script setup>
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import LabelBox from '@/components/LabelBox/index.vue';
  import Pagination from '@/components/Pagination/index.vue';
  import ComplaintStatistics from './ComplaintStatistics.vue';
  import DissatisfactionAnalysis from './DissatisfactionAnalysis.vue';
  import ComplaintTypeStatistics from './ComplaintTypeStatistics.vue';
  import GroupComplaintStatistics from './GroupComplaintStatistics.vue';
</script>
<style lang="less" scoped>
  .composite-box {
    width: 100vw;
    height: 100vh;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;

    .composite-block {
      padding-left: 22px;
      padding-right: 22px;
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .composite-item {
        width: 928px;
        height: 370px;
        display: flex;
        flex-direction: column;
      }
      .title {
        width: 100%;
        height: 42px;
        background-image: url(@/assets/images/composite/title-bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 10px;
        .text {
          font-size: 20px;
          color: #ffffff;
          line-height: 40px;
          text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
          text-align: left;
          background: linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #57debd 100%);
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
          padding-left: 35px;
        }
      }
    }
  }
</style>
