<template>
  <div class="category-box">
    <div class="title">
      <div class="text">案件性质分类</div>
    </div>
    <div class="category-list">
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/normal-icon.png" alt="" />
        <div class="category-info">
          <div class="name">普通案件</div>
          <div class="count">{{ data.normalCase.value }}</div>
          <div class="comparison">
            <div>同比</div>
            <img v-if="data.normalCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.normalCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.normalCase.percent }}</div>
          </div>
        </div>
      </div>
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/enterprise-icon.png" alt="" />
        <div class="category-info">
          <div class="name">企业案件</div>
          <div class="count">{{ data.enterpriseCase.value }}</div>
          <div class="comparison">
            <div>同比</div>
            <img v-if="data.enterpriseCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.enterpriseCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.enterpriseCase.percent }}</div>
          </div>
        </div>
      </div>
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/group-icon.png" alt="" />
        <div class="category-info">
          <div class="name">群诉案件</div>
          <div class="count">{{ data.groupCase.value }}</div>
          <div class="comparison">
            <div>同比</div>
            <img v-if="data.groupCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.groupCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.groupCase.percent }}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="height: 20px"></div>
    <div class="title">
      <div class="text">各科室排名</div>
      <LabelBox />
      <Pagination :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
    </div>
    <div class="ranking-list">
      <div class="ranking-item" v-for="(item, index) in ranking" :key="item.value">
        <div class="ranking-top">
          <img v-if="index < 3" class="top" :src="item.icon" alt="" />
          <div v-else class="top">{{ item.id }}</div>
          <div class="name">{{ item.name }}</div>
          <div class="progres">
            <Progress :progress="item.value" start-color="rgba(125, 249, 218, 0)" end-color="rgba(133, 255, 224, 0.70)" />
            <Progress :progress="item.percentage" start-color="rgba(255, 132, 71, 0)" end-color="rgba(255, 119, 51, 1)" showUnit />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import Progress from '@/components/Progress/index.vue';
  import top1 from '@/assets/images/runtime/ranking/top1.png';
  import top2 from '@/assets/images/runtime/ranking/top2.png';
  import top3 from '@/assets/images/runtime/ranking/top3.png';
  import LabelBox from '@/components/LabelBox/index.vue';
  import Pagination from '@/components/Pagination/index.vue';

  const ranking = ref([
    { id: 1, icon: top1, name: '科室1名称', value: 128, percentage: 99.8 },
    { id: 2, icon: top2, name: '科室2名称', value: 99, percentage: 96.7 },
    { id: 3, icon: top3, name: '科室3名称', value: 128, percentage: 93 },
    { id: 4, name: '科室4名称', value: 80, percentage: 88 },
    { id: 5, name: '科室5名称', value: 53, percentage: 86.8 },
    { id: 6, name: '科室6名称', value: 140, percentage: 88.2 },
    { id: 7, name: '科室7名称', value: 53, percentage: 86.8 },
    { id: 8, name: '科室8名称', value: 140, percentage: 85.2 },
    { id: 9, name: '科室9名称', value: 64, percentage: 84 },
    { id: 10, name: '科室10名称', value: 70, percentage: 81.2 },
  ]);
  const data = ref({
    normalCase: {
      value: 761,
      percent: 8.2,
      status: 1,
    },
    enterpriseCase: {
      value: 761,
      percent: 0.5,
      status: 2,
    },
    groupCase: {
      value: 125,
      percent: 8.2,
      status: 1,
    },
  });
  console.log(data);

  const onPrevPage = () => {
    console.log('上一页');
  };
  const onNextPage = () => {
    console.log('下一页');
  };
</script>

<style lang="less" scoped>
  .category-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      width: 100%;
      height: 42px;
      background-image: url(@/assets/images/runtime/overview/title.png);
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
    .category-list {
      display: flex;
      align-items: center;

      margin-top: 17px;
      .category-item {
        width: 154px;
        height: 106px;
        background-image: url(@/assets/images/runtime/category/category-bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        padding-left: 10px;
      }
      .category-icon {
        width: 56px;
        height: 56px;
        display: block;
      }
      .category-info {
        display: flex;
        flex-direction: column;
        font-weight: 400;
        font-size: 14px;
        color: #e4fff9;
        .name {
          font-weight: 400;
          font-size: 16px;
          color: #ffffff;
        }
        .count {
          font-size: 24px;
          color: #ffffff;
          margin-top: 8px 0;
        }
        .comparison {
          display: flex;
          align-items: center;

          .percent-icon {
            width: 9px;
            height: 11px;
            margin: 0 4px;
          }
        }
      }
    }
    .ranking-list {
      width: 100%;
      margin-top: 10px;

      .ranking-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        background-size: 100% 100%;
        background-repeat: no-repeat;

        &:nth-child(odd) {
          background-image: url(@/assets/images/runtime/ranking/category-bg.png);
        }

        &:hover {
          cursor: pointer;
          background-image: url(@/assets/images/runtime/ranking/top_hover.png);
        }

        .ranking-top {
          display: flex;
          align-items: center;
          width: 100%;
          height: 70px;
          margin-left: -10px;
          .top {
            width: 56px;
            height: 58px;
            font-weight: 400;
            font-size: 14px;
            color: #e4fff9;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .name {
            width: 75px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            font-weight: 400;
            font-size: 16px;
            color: #ffffff;
          }

          .progres {
            flex: 1;
            height: 100%;
            padding: 6px 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
        }
      }
    }
  }
</style>
