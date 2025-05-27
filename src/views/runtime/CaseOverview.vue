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
      <EmptyState v-if="isCompositeEmpty" />
      <CaseSummaryChart v-else :seriesData="compositeData" />
      <div class="title">
        <div class="sub-text">直派双是率</div>
      </div>
      <!-- 案件总览 -->
      <EmptyState v-if="isDirectEmpty" />
      <CaseSummaryChart v-else :seriesData="directData" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import errorbg from '@/assets/images/runtime/overview/error.png';
  import waitbg from '@/assets/images/runtime/overview/wait.png';
  import donebg from '@/assets/images/runtime/overview/done.png';
  import caseIcon from '@/assets/images/runtime/overview/case-icon.png';
  import doingIcon from '@/assets/images/runtime/overview/doing-icon.png';
  import CaseSummaryChart from './CaseSummaryChart.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import { message } from 'ant-design-vue';
  import { getOverviewCount, getSatisfyRate } from '@/api/complaint/statistic';
  import { calculateYoY } from '@/utils/dashboard';
  import EmptyState from '@/components/EmptyState/index.vue';

  const tabs = [{ value: 2, label: '期' }];
  const totalCase = ref(0);
  const doingCase = ref(0);
  const statusData = ref([
    {
      label: '待分配',
      value: 0,
      bg: errorbg,
    },
    {
      label: '待回复',
      value: 0,
      bg: waitbg,
    },
    {
      label: '二次办理',
      value: 0,
      bg: waitbg,
    },
    {
      label: '待回访',
      value: 0,
      bg: waitbg,
    },
    {
      label: '待审核',
      value: 0,
      bg: waitbg,
    },
    {
      label: '已办结',
      value: 0,
      bg: donebg,
    },
  ]);

  // 判断是否为空状态
  const isDirectEmpty = ref(false);
  const isCompositeEmpty = ref(false);

  // 案件总结数据
  const directData = ref([
    {
      value: 0,
      name: '双是',
      rate: 0,
      color: '62, 237, 241',
    },
    {
      value: 0,
      name: '单是',
      rate: 0,
      color: '242, 127, 69',
    },
    {
      value: 0,
      name: '双否',
      rate: 0,
      color: '224, 224, 224',
    },
    {
      value: 0,
      name: '其他',
      rate: 0,
      color: '244, 229, 106',
    },
  ]);
  const compositeData = ref([
    {
      value: 0,
      name: '双是',
      rate: 0,
      color: '62, 237, 241',
    },
    {
      value: 0,
      name: '单是',
      rate: 0,
      color: '242, 127, 69',
    },
    {
      value: 0,
      name: '双否',
      rate: 0,
      color: '224, 224, 224',
    },
    {
      value: 0,
      name: '其他',
      rate: 0,
      color: '244, 229, 106',
    },
  ]);

  onMounted(() => {
    fetchOverview();
    fetchRate();
  });

  const fetchOverview = async () => {
    try {
      const res: any = await getOverviewCount();
      console.log(res);
      const { completCount, processingCount, receiveCount, twoHandleCount, waitAssignCount, waitAuditCount, waitReplyCount, waitVisitCount } = res;
      totalCase.value = receiveCount;
      doingCase.value = processingCount;

      statusData.value = [
        {
          label: '待分配',
          value: waitAssignCount,
          bg: errorbg,
        },
        {
          label: '待回复',
          value: waitReplyCount,
          bg: waitbg,
        },
        {
          label: '二次办理',
          value: twoHandleCount,
          bg: waitbg,
        },
        {
          label: '待回访',
          value: waitVisitCount,
          bg: waitbg,
        },
        {
          label: '待审核',
          value: waitAuditCount,
          bg: waitbg,
        },
        {
          label: '已办结',
          value: completCount,
          bg: donebg,
        },
      ];
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    } finally {
    }
  };

  const fetchRate = async () => {
    try {
      const directRes: any = await getSatisfyRate({
        sourceType: 1,
      });

      // 检查直派数据是否全为0
      isDirectEmpty.value = checkIfAllZero(directRes);

      directData.value = [
        {
          value: directRes.doubleYes,
          name: '双是',
          rate: calculateYoY(directRes.doubleYes, directRes.lastDoubleYes),
          color: '62, 237, 241',
        },
        {
          value: directRes.singleYes,
          name: '单是',
          rate: calculateYoY(directRes.singleYes, directRes.lastSingleYes),
          color: '242, 127, 69',
        },
        {
          value: directRes.doubleNo,
          name: '双否',
          rate: calculateYoY(directRes.doubleNo, directRes.lastDoubleNo),
          color: '224, 224, 224',
        },
        {
          value: directRes.other,
          name: '其他',
          rate: calculateYoY(directRes.other, directRes.lastOther),
          color: '244, 229, 106',
        },
      ];
      const compositeRes: any = await getSatisfyRate();

      // 检查综合数据是否全为0
      isCompositeEmpty.value = checkIfAllZero(compositeRes);

      compositeData.value = [
        {
          value: compositeRes.doubleYes,
          name: '双是',
          rate: calculateYoY(compositeRes.doubleYes, compositeRes.lastDoubleYes),
          color: '62, 237, 241',
        },
        {
          value: compositeRes.singleYes,
          name: '单是',
          rate: calculateYoY(compositeRes.singleYes, compositeRes.lastSingleYes),
          color: '242, 127, 69',
        },
        {
          value: compositeRes.doubleNo,
          name: '双否',
          rate: calculateYoY(compositeRes.doubleNo, compositeRes.lastDoubleNo),
          color: '224, 224, 224',
        },
        {
          value: compositeRes.other,
          name: '其他',
          rate: calculateYoY(compositeRes.other, compositeRes.lastOther),
          color: '244, 229, 106',
        },
      ];
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  // 检查数据是否全为0
  const checkIfAllZero = (data: any) => {
    if (!data) return true;
    return data.doubleYes === 0 && data.singleYes === 0 && data.doubleNo === 0 && data.other === 0;
  };
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
