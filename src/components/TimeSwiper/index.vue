<template>
  <div class="range-container">
    <div
      class="range-button range-left"
      :class="{
        disabled: currentPage === 1,
      }"
      @click="prevPage"
    >
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
        disabled: currentPage === totalPages,
      }"
      @click="nextPage"
    >
      <div class="icon"></div>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue';

  const props = defineProps({
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

  // 总页数
  const totalPages = ref(props.maxPage);

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
