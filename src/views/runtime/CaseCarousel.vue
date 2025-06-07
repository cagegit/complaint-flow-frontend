<template>
  <div class="case-carousel-container">
    <div class="title">
      <div class="text">案件轮动</div>
      <div class="warning-box">
        <div>预警：</div>
        <div class="warning-one">
          <div class="icon"></div>
          <div>≤48小时</div>
        </div>
        <div class="warning-two">
          <div class="icon"></div>
          <div>≤72小时</div>
        </div>
        <div class="warning-three">
          <div class="icon"></div>
          <div>≤96小时</div>
        </div>
      </div>
    </div>
    <div class="carousel-title">
      <div class="label"></div>
      <div class="colume1">来源</div>
      <div class="colume2">标题</div>
      <div class="colume3">时间</div>
      <div class="colume4">处理科室</div>
      <div class="colume5">处理社区</div>
    </div>
    <div class="carousel-list">
      <div class="carousel-item" v-for="(item, index) in issuesData" :key="index" @click="showItemDetails(item)">
        <div class="label">
          <div class="status" :style="{ background: getTimeLevelColor(item.timeLevel || 0) }"></div>
        </div>
        <div class="type">{{ item.sourceType_dictText || '-' }}</div>
        <div class="table-title">{{ item.title }}</div>
        <div class="time">
          <span class="date">{{ getDate(item.createTime) }}</span>
          <span class="text">{{ getTime(item.createTime) }}</span>
        </div>
        <div class="department">{{ item.assignDepts || '-' }}</div>
        <div class="community">{{ item.assignCommunitys || '-' }}</div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="'案件详情'"
      :footer="null"
      :mask-closable="true"
      :width="800"
      class="case-detail-modal"
      @cancel="modalVisible = false"
    >
      <div class="case-detail-content">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-label">案件编号：</div>
              <div class="detail-value">{{ currentItem.caseNumber || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">工单编号：</div>
              <div class="detail-value">{{ currentItem.workOrderNumber || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">标题：</div>
              <div class="detail-value">{{ currentItem.title || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来源：</div>
              <div class="detail-value">{{ currentItem.sourceType_dictText || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">工单类型：</div>
              <div class="detail-value">{{ currentItem.workOrderCategory || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">案件性质：</div>
              <div class="detail-value">{{ currentItem.caseNature_dictText || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">问题类别：</div>
              <div class="detail-value">{{ currentItem.questionCategory || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">创建时间：</div>
              <div class="detail-value">{{ currentItem.createTime || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">截止时间：</div>
              <div class="detail-value">{{ currentItem.deadline || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理时限：</div>
              <div class="detail-value">{{ currentItem.resolveTimeLimit || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">时间等级：</div>
              <div class="detail-value">
                <span class="time-level-dot" :style="{ background: getTimeLevelColor(currentItem.timeLevel || 0) }"></span>
                {{ getTimeLevelText(currentItem.timeLevel) }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来电人：</div>
              <div class="detail-value">{{ currentItem.callUserName || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">联系电话：</div>
              <div class="detail-value">{{ currentItem.callPhoneNumber || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来电地址：</div>
              <div class="detail-value">{{ currentItem.callUserAddress || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来电时间：</div>
              <div class="detail-value">{{ currentItem.callTime || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">发生地址：</div>
              <div class="detail-value">{{ currentItem.occurrenceAddress || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">受理部门：</div>
              <div class="detail-value">{{ currentItem.acceptDepartment || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理部门：</div>
              <div class="detail-value">{{ currentItem.resolveDepartment || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理科室：</div>
              <div class="detail-value">{{ currentItem.assignDepts || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理社区：</div>
              <div class="detail-value">{{ currentItem.assignCommunitys || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理状态：</div>
              <div class="detail-value">{{ currentItem.processName || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">接收状态：</div>
              <div class="detail-value">{{ currentItem.receiveStatus_dictText || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理次数：</div>
              <div class="detail-value">{{ currentItem.resolveCount || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">发送时间：</div>
              <div class="detail-value">{{ currentItem.sendTime || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">发送人：</div>
              <div class="detail-value">{{ currentItem.sendUser || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">更新时间：</div>
              <div class="detail-value">{{ currentItem.updateTime || '-' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">更新人：</div>
              <div class="detail-value">{{ currentItem.updateBy || '-' }}</div> </div
            ><div class="detail-row full-width">
              <div class="detail-label">主要内容：</div>
              <div class="detail-value">{{ currentItem.mainContent || '-' }}</div>
            </div>
            <div class="detail-row full-width">
              <div class="detail-label">处理意见：</div>
              <div class="detail-value">{{ currentItem.resolveOpinion || '-' }}</div>
            </div>
            <div class="detail-row full-width">
              <div class="detail-label">最终结果：</div>
              <div class="detail-value">{{ currentItem.finalResolveResult || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import { getScrollPageList } from '@/api/complaint/statistic';
  import { getDictItems } from '/@/api/common/api';
  import { TimeLevelItem } from '/@/enums/statisticEnum';

  interface IssueItem {
    id?: string | number;
    timeLevel?: number;
    sourceType?: string | number;
    title?: string;
    createTime?: string;
    assignDepts?: string;
    assignCommunitys?: string;
    sourceType_dictText?: string;
    acceptDepartment?: string;
    callPhoneNumber?: string;
    callTime?: string;
    callUserAddress?: string;
    callUserName?: string;
    caseNature?: number;
    caseNature_dictText?: string;
    caseNumber?: string;
    categoryOne?: string;
    categoryTwo?: string;
    categoryThree?: string;
    contactInfo?: string;
    createBy?: string;
    createUserId?: string;
    deadline?: string;
    finalResolveResult?: string;
    importTime?: string;
    mainContent?: string;
    monitorType?: number;
    monthCount?: number;
    occurrenceAddress?: string;
    orgId?: string;
    originalLabel?: string;
    processCode?: string;
    processName?: string;
    processStatus?: number;
    questionCategory?: string;
    receiveStatus?: number;
    receiveStatus_dictText?: string;
    resolveCount?: number;
    resolveDepartment?: string;
    resolveFlag?: number;
    resolveOpinion?: string;
    resolveTimeLimit?: string;
    satisfyFlag?: number;
    sendTime?: string;
    sendUser?: string;
    updateBy?: string;
    updateTime?: string;
    updateUserId?: string;
    workOrderCategory?: string;
    workOrderNumber?: string;
    yearCount?: number;
  }

  const issuesData = ref<IssueItem[]>([]);
  const currentNum = ref(1);
  const timer = ref<NodeJS.Timeout | null>(null);
  const timeLevelDict = ref<TimeLevelItem[]>([]);

  // 弹窗相关
  const modalVisible = ref(false);
  const currentItem = ref<IssueItem>({});

  const fetchTimeLevelDict = async () => {
    try {
      const res = await getDictItems('biz_time_level');
      if (res && Array.isArray(res)) {
        timeLevelDict.value = res;
      }
    } catch (error) {
      console.error('获取字典数据失败', error);
    }
  };

  const getTimeLevelColor = (timeLevel: number) => {
    return timeLevelDict.value.find((item) => Number(item.value) === timeLevel)?.color || 'rgba(255,255,255,0)';
  };

  const getTimeLevelText = (timeLevel?: number) => {
    if (!timeLevel) return '未知';
    const item = timeLevelDict.value.find((item) => Number(item.value) === timeLevel);
    return item ? item.text : '未知';
  };

  // 显示详情弹窗
  const showItemDetails = (item: IssueItem) => {
    currentItem.value = { ...item };
    modalVisible.value = true;
  };

  onMounted(() => {
    fetchData(currentNum.value);
    fetchTimeLevelDict();
    timer.value = setInterval(() => {
      currentNum.value = currentNum.value + 1;
      fetchData(currentNum.value);
    }, 10000);
  });

  const fetchData = async (pageNum) => {
    try {
      const res: any = await getScrollPageList({
        pageNum,
        pageSize: 9,
      });
      const { list } = res;
      issuesData.value = list;
      if (list.length < 9) {
        currentNum.value = 0;
      }
      console.log(res);
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  onBeforeUnmount(() => {
    if (timer.value) {
      clearInterval(timer.value);
    }
  });

  const getDate = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = dayjs(timeStr).format('MM.DD');
    return date;
  };

  const getTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = dayjs(timeStr).format('HH:mm:ss');
    return date;
  };
</script>

<style lang="less" scoped>
  .case-carousel-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      width: 100%;
      height: 43px;
      background-image: url(@/assets/images/runtime/sub-title-bg.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: space-between;
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

      .warning-box {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-weight: 400;
        font-size: 16px;
        color: #b0e1d9;
        .warning-one,
        .warning-two,
        .warning-three {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
          margin-right: 24px;
          height: 100%;
          .icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
          }
        }

        .warning-one {
          .icon {
            background: #ff5858;
          }
        }
      }
      .warning-two {
        .icon {
          background: #ff8447;
        }
      }
      .warning-three {
        .icon {
          background: #ffef6e;
        }
      }
    }
    .carousel-title {
      font-weight: 500;
      font-size: 14px;
      color: #b0e1d9;
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      margin-top: 12px;
      background: linear-gradient(270deg, rgba(144, 241, 224, 0.05) 0%, rgba(71, 187, 158, 0.1) 100%);
      .label {
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .colume1 {
        width: 48px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .colume2 {
        width: 384px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 20px;
        margin-left: 20px;
      }
      .colume3 {
        width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 20px;
      }
      .colume4 {
        width: 144px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 20px;
      }
      .colume5 {
        width: 144px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 20px;
      }
    }
    .carousel-list {
      width: 100%;
      height: 372px;
      overflow: hidden;
      margin-top: 10px;

      .carousel-item {
        width: 100%;
        display: flex;
        align-items: center;
        width: 100%;
        height: 40px;
        background-size: 100% 100%;
        background-repeat: no-repeat;

        &:nth-child(odd) {
          background-image: url(@/assets/images/runtime/ranking/top_bg.png);
        }

        &:hover {
          cursor: pointer;
          background-image: url(@/assets/images/runtime/ranking/top_hover.png);
        }
        .label {
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          .status {
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
        }
        .type {
          width: 48px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 400;
          font-size: 16px;
          color: #b2d9d1;
        }
        .table-title {
          width: 384px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 400;
          font-size: 16px;
          margin-left: 20px;
          color: #ffffff;
        }
        .time {
          width: 100px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          display: flex;
          align-items: baseline;
          margin-left: 20px;
          flex-shrink: 0;
          .date {
            font-size: 14px;
            color: #ffffff;
          }
          .text {
            font-size: 14px;
            color: #b2d9d1;
            margin-left: 4px;
          }
        }
        .department {
          width: 144px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 400;
          font-size: 16px;
          color: #ffffff;
          margin-left: 20px;
        }
        .community {
          width: 144px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 400;
          font-size: 16px;
          color: #ffffff;
          margin-left: 20px;
        }
      }
    }
  }

  // 详情弹窗样式
  :deep(.case-detail-modal) {
    .ant-modal-content {
      background: rgba(4, 42, 43, 0.9);
      border: 1px solid #357f71;
      backdrop-filter: blur(10px);
    }

    .ant-modal-header {
      background: transparent;
      border-bottom: 1px solid rgba(53, 127, 113, 0.5);

      .ant-modal-title {
        color: #e4fff9;
        font-size: 18px;
      }
    }

    .ant-modal-close {
      color: #e4fff9;
    }

    .ant-modal-body {
      padding: 20px;
      max-height: 70vh;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(53, 127, 113, 0.7);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-track {
        background-color: rgba(4, 42, 43, 0.3);
      }
    }
  }

  .case-detail-content {
    .detail-section {
      margin-bottom: 24px;
      padding: 10px 20px;

      h3 {
        color: #333333;
        font-size: 18px;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(53, 127, 113, 0.5);
        padding-bottom: 8px;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }

    .detail-row {
      display: flex;
      margin-bottom: 12px;

      &.full-width {
        grid-column: 1 / -1;
        flex-direction: column;

        .detail-label {
          width: 100%;
          text-align: left;
          padding-right: 0;
          margin-bottom: 8px;
        }
      }

      .detail-label {
        width: 100px;
        color: #000;
        font-size: 16px;
        text-align: right;
        padding-right: 12px;
        flex-shrink: 0;
      }

      .detail-value {
        color: #333333;
        font-size: 16px;
        flex: 1;
        word-break: break-all;

        .time-level-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
      }
    }
  }
</style>
