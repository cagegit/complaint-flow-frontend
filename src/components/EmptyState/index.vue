<template>
  <div class="empty-state">
    <img :src="noDataIcon" alt="暂无数据" class="empty-icon" />
    <div class="empty-text">暂无数据~</div>
  </div>
</template>

<script setup lang="ts">
  import noDataIcon from '@/assets/images/runtime/empty.png';

  defineOptions({
    name: 'EmptyStateComponent',
  });
</script>

<style lang="less" scoped>
  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 20px 0;

    .empty-icon {
      width: 110px;
      height: 96px;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 14px;
      color: #b0e1d9;
    }
  }
</style>
