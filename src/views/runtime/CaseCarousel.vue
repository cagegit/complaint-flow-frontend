<template>
  <div class="case-carousel-container">
    <div class="title">
      <div class="text">案件轮动</div>
      <div class="warning-box">
        <div>预警：</div>
        <div class="warning-one">
          <div class="icon"></div>
          <div>≤48h</div>
        </div>
        <div class="warning-two">
          <div class="icon"></div>
          <div>≤72h</div>
        </div>
        <div class="warning-three">
          <div class="icon"></div>
          <div>≤96h</div>
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
      <div class="carousel-item" v-for="(item, index) in issuesData" :key="item.value">
        <div class="label">
          <div v-if="item.timeLevel === 1" class="status-one"></div>
          <div v-else-if="item.timeLevel === 2" class="status-two"></div>
          <div v-else-if="item.timeLevel === 3" class="status-three"></div>
        </div>
        <div class="type">{{ SourceTypeNameMap[item.type] }}</div>
        <div class="table-title">{{ item.title }}</div>
        <div class="time">
          <div class="date">{{ getDate(item.createTime) }}</div>
          <div class="text">{{ getTime(item.createTime) }}</div>
        </div>
        <div class="department">{{ item.assignDepts }}</div>
        <div class="community">{{ item.assignCommunitys }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import { getAssignPageList } from '@/api/complaint/statistic';
  import { SourceTypeNameMap } from '@/enums/statisticEnum';

  //   const allData = ref([
  //     {
  //       type: 0,
  //       title: '小区外道路乱停违停，造成交通堵塞，小区住户反映强烈',
  //       createTime: '2023-12-28 09:23:19',
  //       assignDepts: '科室1',
  //       assignCommunitys: '社区名称A',
  //       timeLevel: 1,
  //     },
  //   ]);

  const issuesData = ref([]);
  const currentNum = ref(1);
  const timer = ref<NodeJS.Timeout | null>(null);

  onMounted(() => {
    fetchData(currentNum.value);
    timer.value = setInterval(() => {
      currentNum.value = currentNum.value + 1;
      fetchData(currentNum.value);
    }, 5000);
  });

  const fetchData = async (pageNum) => {
    try {
      const res: any = await getAssignPageList({
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

  const getDate = (timeStr) => {
    const date = dayjs(timeStr).format('MM.DD');
    return date;
  };
  const getTime = (timeStr) => {
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
          .status-one {
            width: 6px;
            height: 6px;
            background: #ff5858;
            border-radius: 50%;
          }
          .status-two {
            width: 6px;
            height: 6px;
            background: #ff8447;
            border-radius: 50%;
          }
          .status-three {
            width: 6px;
            height: 6px;
            background: #ffef6e;
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
</style>
