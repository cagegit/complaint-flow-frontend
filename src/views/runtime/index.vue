<template>
  <div class="runtime-box" id="runtime-screen">
    <Header :index="1" :showAvatar="true" />
    <Title title="运行事态" />
    <div class="content">
      <div class="left">
        <CaseOverview />
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
<script setup lang="ts" name="ComplaintRuntime">
  import { onMounted, onUnmounted, ref, provide } from 'vue';
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import CaseOverview from './CaseOverview.vue';
  import CaseCarousel from './CaseCarousel.vue';
  import CaseTypeStatistics from './CaseTypeStatistics.vue';
  import CaseTypeCategory from './CaseTypeCategory.vue';
  import { getDictItems } from '/@/api/common/api';
  import { DictItem } from '/@/enums/statisticEnum';
  import autofit from 'autofit.js';

  // 创建一个刷新数据的自定义事件
  const refreshData = () => {
    window.dispatchEvent(new CustomEvent('refresh-runtime-data'));
    console.log('触发数据刷新事件');
  };

  // 定时器引用
  let refreshTimer: number | null = null;

  const sourceTypeDict = ref<DictItem[]>([]);

  onMounted(() => {
    autofit.init({
      dw: 1920,
      dh: 1080,
      resize: true,
      el: '#runtime-screen',
    });
    fetchSourceTypeDict();

    // 设置每10分钟刷新一次数据的定时器
    refreshTimer = window.setInterval(
      () => {
        refreshData();
      },
      6 * 10 * 60 * 1000
    ); // 10分钟 = 10 * 60 * 1000毫秒
  });

  // 获取字典数据
  const fetchSourceTypeDict = async () => {
    try {
      const res = await getDictItems('biz_source_type');
      if (res && Array.isArray(res)) {
        sourceTypeDict.value = res;
      }
    } catch (error) {
      console.error('获取字典数据失败', error);
    }
  };

  onUnmounted(() => {
    // 清除定时器
    if (refreshTimer !== null) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    autofit?.off?.();
  });
</script>
<style lang="less" scoped>
  .runtime-box {
    width: 100%;
    min-width: 1080px;
    height: 100%;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      padding: 6px 24px;
      box-sizing: border-box;
      min-height: 0; // 允许内容区域缩小

      .left {
        width: 25%; // 使用百分比替代固定像素值
        min-width: 320px;
        margin-right: 10px;
        height: 100%;
      }

      .center {
        width: 50%; // 使用百分比替代固定像素值
        min-width: 600px;
        height: 100%;
        display: flex;
        flex-direction: column;
        margin: 0 10px;
        .case-type-chart {
          flex: 1;
          width: 100%;
        }
      }

      .right {
        width: 25%; // 使用百分比替代固定像素值
        min-width: 320px;
        margin-left: 10px;
        height: 100%;
      }
    }
  }

  /* 媒体查询，针对不同宽度的设备 */
  @media screen and (max-width: 1400px) {
    .runtime-box .content {
      .left,
      .right {
        min-width: 300px;
      }
      .center {
        min-width: 500px;
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .runtime-box .content {
      .left,
      .right {
        min-width: 280px;
      }
      .center {
        min-width: 480px;
      }
    }
  }

  @media screen and (max-width: 1080px) {
    .runtime-box {
      overflow-x: auto;
    }
  }
</style>
