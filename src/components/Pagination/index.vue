<template>
  <div class="pagination-container">
    <div
      class="pagination-button pagination-left"
      :class="{
        disabled: currentPage === 1,
      }"
      @click="prevPage"
    >
      <div class="icon"></div>
    </div>
    <div class="pagination-item" v-for="(item, index) in maxPage" :key="index">
      <div
        :class="{
          'pagination-item-icon': true,
          active: currentPage === index + 1,
        }"
      ></div>
    </div>
    <div
      class="pagination-button pagination-right"
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
    maxPage: {
      type: Number,
      required: true,
    },
    onPrevPage: {
      type: Function,
      required: false,
    },
    onNextPage: {
      type: Function,
      required: false,
    },
  });

  // 当前页码
  const currentPage = ref(1);
  // 总页数
  const totalPages = ref(props.maxPage);

  // 上一页方法
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      if (props.onPrevPage) {
        props.onPrevPage();
      }
    }
  };
  // 下一页方法
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      if (props.onNextPage) {
        props.onNextPage();
      }
    }
  };
</script>
<style lang="less" scoped>
  .pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pagination-item {
    display: flex;
    align-items: center;
    margin-right: 16px;
    &:last-of-type {
      margin-right: 0;
    }

    .pagination-item-icon {
      width: 6px;
      height: 6px;
      background: linear-gradient(180deg, #ffffff 0%, #85ffe1 100%);
      opacity: 0.3;
      box-shadow: 0px 0px 6px 0px rgba(133, 255, 225, 0.7);
      border-radius: 4px;

      &.active {
        opacity: 1;
      }
    }
  }
  .pagination-button {
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .icon {
      width: 8px;
      height: 12px;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    &.pagination-left {
      margin-right: 16px;
      .icon {
        background-image: url(@/assets/images/runtime/pagination/left-icon.png);
      }
    }
    &.pagination-left&:hover {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/left-hover-icon.png);
      }
    }
    &.pagination-right {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/right-icon.png);
      }
    }
    &.pagination-right&:hover {
      .icon {
        background-image: url(@/assets/images/runtime/pagination/right-hover-icon.png);
      }
    }
    &.disabled {
      .icon {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }
</style>
