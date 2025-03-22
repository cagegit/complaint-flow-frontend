<template>
  <a-progress :percent="percent" show-info="false" />
</template>
<script setup>
  const props = defineProps({
    percent: {
      type: Number,
      required: true,
    },
  });
</script>
<style>
  /* 去除外层圆角 */
  .ant-progress-outer {
    border-radius: 0 !important;
  }

  .ant-progress-inner {
    border-radius: 0 !important;
  }

  /* 去除内层圆角 */
  .ant-progress-bg {
    background: linear-gradient(to right, rgba(24, 144, 255, 0), rgba(24, 144, 255, 1)) !important;
    border-radius: 0 !important;
  }
</style>
