<template>
  <div class="case-overview">
    <div class="title">
      <div class="text">案件总览</div>
      <CustomTabs :data="tabs" />
    </div>
    <div class="long-case">
      <div class="long-case-item">
        <img :src="caseIcon" alt="" class="case-item-l" />
        <div class="case-item-r">
          <div class="case-text">接件数</div>
          <div class="case-number">
            {{ totalCase }}
          </div>
        </div>
      </div>
      <div class="long-case-item">
        <img :src="doingIcon" alt="" class="case-item-l" />
        <div class="case-item-r">
          <div class="case-text">处理中</div>
          <div class="case-number">
            {{ doingCase }}
          </div></div
        >
      </div>
    </div>
    <div class="case-list">
      <div class="case-item" v-for="(item, index) in statusData" :key="index">
        <img :src="item.bg" class="bg-image" alt="" />
        <div class="case-text">{{ item.label }}</div>
        <div class="case-number">{{ item.value }}</div>
      </div>
    </div>
    <div class="chart-box">
      <div class="title">
        <div class="sub-text">综合双是率</div>
      </div>
      <!-- 案件总览 -->
      <CaseSummaryChart :seriesData="summaryData" />
      <div class="title">
        <div class="sub-text">直派双是率</div>
      </div>
      <!-- 案件总览 -->
      <CaseSummaryChart :seriesData="summaryData" />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import errorbg from '@/assets/images/runtime/overview/error.png';
  import waitbg from '@/assets/images/runtime/overview/wait.png';
  import donebg from '@/assets/images/runtime/overview/done.png';
  import caseIcon from '@/assets/images/runtime/overview/case-icon.png';
  import doingIcon from '@/assets/images/runtime/overview/doing-icon.png';
  import CaseSummaryChart from './CaseSummaryChart.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';

  const tabs = [{ value: 2, label: '期' }];
  const totalCase = ref(646);
  const doingCase = ref(646);
  const statusData = ref([
    {
      label: '待分配',
      value: 66,
      bg: errorbg,
    },
    {
      label: '待回复',
      value: 26,
      bg: waitbg,
    },
    {
      label: '二次办理',
      value: 6,
      bg: waitbg,
    },
    {
      label: '待回访',
      value: 11,
      bg: waitbg,
    },
    {
      label: '待审核',
      value: 111,
      bg: waitbg,
    },
    {
      label: '已办结',
      value: 2323,
      bg: donebg,
    },
  ]);

  // 案件总结数据
  const summaryData = ref([
    {
      value: 60,
      name: '双是',
      persent: 3.5,
      color: '62, 237, 241',
    },
    {
      value: 8,
      name: '单是',
      persent: 6,
      color: '242, 127, 69',
    },
    {
      value: 5,
      name: '双否',
      persent: 15,
      color: '224, 224, 224',
    },
    {
      value: 5,
      name: '其他',
      persent: 15,
      color: '244, 229, 106',
    },
  ]);
</script>

<style lang="less" scoped>
  .case-overview {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    .title {
      width: 100%;
      height: 43px;
      background-image: url(@/assets/images/runtime/overview/title.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .text {
        font-size: 20px;
      }
      .sub-text {
        font-size: 16px;
      }
      .text,
      .sub-text {
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

    .long-case {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100px;
      margin-top: 16px;
      .long-case-item {
        display: flex;
        align-items: center;
        padding-left: 10px;
        padding-right: 24px;
        width: 207px;
        height: 100%;
        background-image: url(@/assets/images/runtime/overview/long-bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        .case-item-l {
          width: 64px;
          height: 64px;
          margin-right: 13px;
        }
        .case-item-r {
          display: flex;
          flex-direction: column;
          .case-text {
            font-weight: 500;
            font-size: 16px;
            color: #ffffff;
          }
          .case-number {
            font-weight: bold;
            font-size: 28px;
            color: #ffffff;
            line-height: 32px;
            text-shadow: 0px 0px 6px #6dffdb;
          }
        }
        &:hover {
          cursor: pointer;
        }
      }
    }

    .case-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      width: 100%;
      margin-top: 16px;
      margin-bottom: 20px;

      .case-item {
        width: 154px;
        height: 66px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 18px;
        box-sizing: border-box;
        position: relative;
        padding-bottom: 4px;
        margin-bottom: 5px;
        margin-left: -4px;
        &:hover {
          cursor: pointer;
        }
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
        .case-text {
          position: relative;
          font-size: 16px;
          color: #e4fff9;
          z-index: 1;
        }
        .case-number {
          position: relative;
          font-weight: bold;
          font-size: 24px;
          color: #ffffff;
          z-index: 1;
        }
      }
    }

    .chart-box {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
</style>
