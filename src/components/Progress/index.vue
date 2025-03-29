<template>
  <div class="progress-bar-container">
    <div
      class="progress-bar"
      :style="{
        width: `${progress}%`,
        background: gradientStyle,
      }"
    ></div>
    <div
      class="progress-block"
      :style="{
        ...getStyle(),
        left: `${progress}%`,
      }"
    ></div>
    <div
      :style="{
        left: `${progress}%`,
      }"
      class="progress-text"
      v-if="showText"
      >{{ getText() }}</div
    >
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, nextTick } from 'vue';

  const props = defineProps({
    // 进度值 (0-100)
    progress: {
      type: Number,
      default: 0,
    },
    showUnit: {
      type: Boolean,
      default: false,
    },
    // 是否显示百分比文字
    showText: {
      type: Boolean,
      default: true,
    },
    // 渐变色起始颜色
    startColor: {
      type: String,
      default: 'rgba(125, 249, 218, 0)',
    },
    // 渐变色结束颜色
    endColor: {
      type: String,
      default: 'rgba(133, 255, 224, 0.7)',
    },
  });

  // 计算渐变样式
  const gradientStyle = computed(() => {
    return `linear-gradient(to right, ${props.startColor}, ${props.endColor})`;
  });

  const getText = () => {
    return props.showUnit ? `${props.progress}%` : `${props.progress}`;
  };

  const getStyle = () => {
    return {
      'box-shadow': `0px 0px 6px 1px ${props.endColor}`,
    };
  };
</script>

<style scoped>
  /* 进度条容器 */
  .progress-bar-container {
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

  .progress-bar {
    width: 0%;
    height: 4px;
    border-radius: 0 0 2px 0;
    transition: width 0.8s ease-out;
  }

  .progress-block {
    width: 3px;
    height: 10px;
    background: #fff;
    transform: skewX(-20deg);
    left: 0;
    transition: left 0.8s ease-out;
  }

  .progress-text {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
    margin-left: 12px;
    left: 0;
    transition: left 0.8s ease-out;
  }
</style>
