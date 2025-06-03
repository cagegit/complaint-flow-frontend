<template>
  <div class="composite-box" id="composite-screen">
    <Header :index="0" :showAvatar="true" />
    <Title title="综合事态" />
    <div class="composite-content">
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
  </div>
</template>
<script setup>
  import { onMounted, onUnmounted, onBeforeUnmount } from 'vue';
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import ComplaintStatistics from './ComplaintStatistics.vue';
  import DissatisfactionAnalysis from './DissatisfactionAnalysis.vue';
  import ComplaintTypeStatistics from './ComplaintTypeStatistics.vue';
  import GroupComplaintStatistics from './GroupComplaintStatistics.vue';
  import autofit from 'autofit.js';
  // 定时器引用
  let refreshTimer = null;
  // 创建一个刷新数据的自定义事件
  const refreshData = () => {
    window.dispatchEvent(new CustomEvent('refresh-runtime-data'));
    console.log('触发数据刷新事件');
  };
  onMounted(() => {
    autofit.init({
      dw: 1920,
      dh: 1080,
      resize: true,
      el: '#composite-screen',
    }); // 设置每10分钟刷新一次数据的定时器
    refreshTimer = window.setInterval(
      () => {
        refreshData();
      },
      6 * 10 * 60 * 1000
    ); // 10分钟 = 10 * 60 * 1000毫秒
  });
  onBeforeUnmount(() => {
    window.removeEventListener('refresh-runtime-data', refreshData);
    window.clearInterval(refreshTimer);
  });
  onUnmounted(() => {
    autofit?.off?.();
  });
</script>
<style lang="less" scoped>
  .composite-box {
    width: 100%;
    height: 100%;
    min-height: 1080px;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow-y: auto;

    .composite-content {
      width: 100%;
      height: calc(100% - 190px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .composite-block {
        padding-left: 22px;
        padding-right: 22px;
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 50%;
        .composite-item {
          width: 49%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }
</style>
