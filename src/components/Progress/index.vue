<template>
  <div class="progress-bar-container">
    <div
      class="progress-bar"
      :style="{
        width: `${animatedProgress}%`,
        background: gradientStyle,
      }"
    ></div>
    <div
      class="progress-block"
      :style="{
        ...getStyle(),
        left: `${animatedProgress}%`,
      }"
    ></div>
    <div
      :style="{
        left: `${animatedProgress}%`,
      }"
      class="progress-text"
      v-if="showText"
      >{{ getText() }}</div
    >
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue';

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
  // 用于动画的进度值
  const animatedProgress = ref(0);

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

  // 进度动画函数
  const animateProgress = (start, end) => {
    const startTime = Date.now();
    const duration = props.animationDuration;

    // 开始值处理，首次加载时使用0
    const startValue = isNaN(start) ? 0 : start;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed < duration) {
        const progress = elapsed / duration;
        // 使用缓动函数让动画更自然
        const easeProgress = easeOutQuad(progress);
        animatedProgress.value = startValue + (end - startValue) * easeProgress;
        requestAnimationFrame(animate);
      } else {
        animatedProgress.value = end;
      }
    };

    requestAnimationFrame(animate);
  };

  // 缓动函数，使动画更平滑
  const easeOutQuad = (t) => {
    return t * (2 - t);
  };

  // 组件挂载时初始化动画
  onMounted(() => {
    animateProgress(0, props.progress);
  });
  // 监听进度值变化并执行动画
  watch(
    () => props.progress,
    (newValue, oldValue) => {
      animateProgress(oldValue, newValue);
    },
    { immediate: true }
  );
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
    flex-shrink: 0;
    transition: left 0.8s ease-out;
  }

  .progress-text {
    flex-shrink: 0;
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
    margin-left: 12px;
    left: 0;
    transition: left 0.8s ease-out;
  }
</style>
