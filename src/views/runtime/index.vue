<template>
  <div class="runtime-box">
    <Header :index="1" :showAvatar="true"/>
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
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
  import CaseOverview from './CaseOverview.vue';
  import CaseCarousel from './CaseCarousel.vue';
  import CaseTypeStatistics from './CaseTypeStatistics.vue';
  import CaseTypeCategory from './CaseTypeCategory.vue';
  import { getDictItems } from '/@/api/common/api';
  import { DictItem } from '/@/enums/statisticEnum';
  // 处理窗口大小变化，通知所有图表组件重新调整大小
  const handleResize = () => {
    // 创建一个自定义事件，所有组件都可以监听此事件
    window.dispatchEvent(new CustomEvent('dashboard-resize'));
  };

  const sourceTypeDict = ref<DictItem[]>([]);

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    fetchSourceTypeDict();

    // 初始加载时也触发一次重绘
    setTimeout(() => {
      handleResize();
    }, 300);
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

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>
<style lang="less" scoped>
  .runtime-box {
    width: 100vw;
    min-width: 1080px;
    height: 100vh;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .content {
      height: calc(100vh - 134px);
      display: flex;
      justify-content: space-between;
      padding: 6px 24px;
      box-sizing: border-box;
      min-height: 0; // 允许内容区域缩小

      .left {
        width: 25%; // 使用百分比替代固定像素值
        min-width: 320px;
        max-width: 446px;
        margin-right: 10px;
        height: 100%;
      }

      .center {
        width: 50%; // 使用百分比替代固定像素值
        min-width: 600px;
        max-width: 932px;
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
        max-width: 446px;
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
