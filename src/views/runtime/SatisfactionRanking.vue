<template>
  <div class="ranking-box">
    <div class="title">
      <div class="text">街镇满意率排名</div>
    </div>
    <div class="ranking-list">
      <div class="ranking-item" v-for="(item, index) in ranking" :key="item.value">
        <div class="ranking-top">
          <img v-if="index < 3" class="top" :src="item.icon" alt="" />
          <div v-else class="top">{{ item.top }}</div>
          <div class="name">{{ item.name }}</div>
          <div class="progres">
            <Progress :progress="item.value" :start-color="item.startColor" :end-color="item.endColor" showUnit />
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

  const ranking = ref([
    {
      startColor: 'rgba(255, 132, 71, 0)',
      endColor: 'rgba(255, 119, 51, 1)',
      name: '万寿路',
      value: 99.8,
      icon: top1,
    },
    {
      startColor: 'rgba(255, 249, 138, 0)',
      endColor: 'rgba(255, 239, 110, 1)',
      name: '石榴庄',
      value: 98.8,
      icon: top2,
    },
    {
      startColor: 'rgba(55, 236, 249, 0)',
      endColor: 'rgba(55, 236, 249, 1)',
      name: '广场街道',
      value: 96.8,
      icon: top3,
    },
    {
      name: '朝阳路',
      value: 89.8,
      top: 34,
    },
    {
      name: '万屋路',
      value: 79.8,
      top: 35,
    },
    {
      name: '小金库',
      value: 77.8,
      top: 36,
    },
    {
      name: '阿发出图录路',
      value: 65.8,
      top: 37,
    },
    {
      name: '来了',
      value: 62.8,
      top: 38,
    },
    {
      name: '范德萨',
      value: 20.8,
      top: 318,
    },
    {
      name: '范德萨',
      value: 10.8,
      top: 319,
    },
  ]);
</script>

<style lang="less" scoped>
  .ranking-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      width: 100%;
      height: 42px;
      background-image: url(@/assets/images/runtime/overview/title.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
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
          background-image: url(@/assets/images/runtime/ranking/top_bg.png);
        }

        &:hover {
          cursor: pointer;
          background-image: url(@/assets/images/runtime/ranking/top_hover.png);
        }

        .ranking-top {
          display: flex;
          align-items: center;
          width: 100%;
          height: 43px;
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
            width: 64px;
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
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
</style>
