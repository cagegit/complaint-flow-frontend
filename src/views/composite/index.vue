<template>
  <div class="composite-box">
    <Header :index="0" />
    <Title title="综合事态" />
    <div class="composite-block">
      <div class="composite-item">
        <div class="title">
          <div class="title-left">
            <div class="text">诉件统计</div>
            <DispatchTabs />
          </div>
          <div class="title-right">
            <CaseLabelBox />
            <div style="width: 24px"></div>
            <CustomTabs :data="complaintTypeTabs" />
          </div>
        </div>
        <div class="composite-content">
          <ComplaintStatistics />
        </div>
      </div>
      <div class="composite-item">
        <div class="title">
          <div class="title-left">
            <div class="text">双否分析</div>
            <DispatchTabs />
          </div>
          <CustomTabs :data="complaintTypeTabs" />
        </div>
        <div class="composite-content">
          <img class="composite-bg" src="@/assets/images/composite/group-bg.png" alt="" />
          <DissatisfactionAnalysis />
        </div>
      </div>
    </div>
    <div class="composite-block">
      <div class="composite-item">
        <div class="title">
          <div class="title-left">
            <div class="text">诉讼类型分析统计</div>
            <DispatchTabs />
          </div>
          <div class="title-right">
            <CaseLabelBox />
            <div style="width: 22px"></div>
            <CustomTabs :data="complaintTypeTabs" />
            <div style="width: 12px"></div>
            <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
          </div>
        </div>
        <div class="composite-content">
          <ComplaintTypeStatistics />
        </div>
      </div>
      <div class="composite-item">
        <div class="title">
          <div class="title-left">
            <div class="text">群诉案件分析</div>
            <DispatchTabs />
          </div>
          <div class="title-right">
            <CaseLabelBox />
            <div style="width: 24px"></div>
            <CustomTabs :data="complaintTypeTabs" />
          </div>
        </div>
        <div class="composite-content">
          <GroupComplaintStatistics />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import Pagination from '@/components/Pagination/index.vue';
  import ComplaintStatistics from './ComplaintStatistics.vue';
  import DissatisfactionAnalysis from './DissatisfactionAnalysis.vue';
  import ComplaintTypeStatistics from './ComplaintTypeStatistics.vue';
  import GroupComplaintStatistics from './GroupComplaintStatistics.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';

  const complaintTypeTabs = [
    {
      value: 2,
      label: '期',
    },
    {
      value: 3,
      label: '年',
    },
  ];
</script>
<style lang="less" scoped>
  .composite-box {
    width: 100vw;
    height: 1080px;
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
        height: 444px;
        display: flex;
        flex-direction: column;

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

          .title-left {
            display: flex;
            align-items: center;

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
              margin-right: 20px;
            }
          }
          .title-right {
            display: flex;
            align-items: center;
          }
        }

        .composite-content {
          position: relative;
          flex: 1;
          padding-top: 10px;
          box-sizing: border-box;

          .composite-bg {
            position: absolute;
            width: 356px;
            height: 356px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
    }
  }
</style>
