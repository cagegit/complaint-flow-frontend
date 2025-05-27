<template>
  <div class="range-container" :style="{ top: `${top}px` }">
    <div class="range-button range-left" @click="prevPage">
      <div class="icon"></div>
    </div>
    <div class="range">
      <div>{{ startTime }}</div>
      <div class="line">——</div>
      <div>{{ endTime }}</div>
    </div>
    <div
      class="range-button range-right"
      :class="{
        disabled: isEnd,
      }"
      @click="nextPage"
    >
      <div class="icon"></div>
    </div>
  </div>
</template>
<script setup>
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps({
    top: {
      type: Number,
      default: 10,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    onPrev: {
      type: Function,
      required: false,
    },
    onNext: {
      type: Function,
      required: false,
    },
  });

  // 解析中文日期格式
  const parseChineseDate = (dateStr) => {
    const match = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (match) {
      const [_, year, month, day] = match;
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const isEnd = computed(() => {
    // 先将中文日期转换为标准格式
    const standardDate = parseChineseDate(props.endTime);
    const endOfDay = dayjs(standardDate).endOf('day');
    const now = dayjs();
    return endOfDay.isAfter(now);
  });

  // 上一页方法
  const prevPage = () => {
    if (props.onPrev) {
      props.onPrev();
    }
  };
  // 下一页方法
  const nextPage = () => {
    if (props.onNext) {
      props.onNext();
    }
  };
</script>
<style lang="less" scoped>
  .range-container {
    width: 315px;
    height: 24px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: url(@/assets/images/composite/range-bg.png) no-repeat;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    padding: 0 10px;
    position: absolute;
    top: 10px;
    left: 50%;
    z-index: 1;
    transform: translateX(-50%);
  }
  .range {
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #b9f5ec;
    .line {
      margin: 0 6px;
    }
  }
  .range-button {
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .icon {
      width: 6px;
      height: 10px;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    &.range-left {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/left-icon.png);
      }
    }
    &.range-left&:hover {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/left-hover-icon.png);
      }
    }
    &.range-right {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/right-icon.png);
      }
    }
    &.range-right&:hover {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/right-hover-icon.png);
      }
    }
    &.disabled {
      .icon {
        visibility: hidden;
      }
    }
  }
</style>
