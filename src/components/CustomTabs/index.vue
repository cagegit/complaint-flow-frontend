<template>
  <div class="tab-list">
    <div
      v-for="(item, index) in props.data"
      @click="onClick(item, index)"
      :key="index"
      :class="{
        'tab-item': true,
        active: currentIndex === index,
      }"
    >
      <span class="tab-text">{{ item.label }}</span>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue';
  const currentIndex = ref(0);

  const props = defineProps({
    onTabChange: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Array,
      default: () => [],
    },
  });

  const onClick = (item, index) => {
    if (currentIndex.value === index) {
      return;
    }
    console.log('currentIndex', item);
    currentIndex.value = index;
    props.onTabChange(item.value);
  };
</script>
<style lang="less" scoped>
  .tab-list {
    display: flex;
    align-items: center;
    height: 40px;
    .tab-item {
      width: 32px;
      height: 32px;
      background-image: url(@/assets/images/runtime/tab-bg.png);
      background-repeat: no-repeat;
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-family: SourceHanSansCN, SourceHanSansCN;
      font-weight: 400;
      font-size: 16px;
      color: #81aea4;
      cursor: pointer;

      &.active {
        background-image: url(@/assets/images/runtime/tab-select-bg.png);
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        text-align: left;

        .tab-text {
          text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
          text-align: left;
          background: linear-gradient(180deg, #ffffff 0%, #ffffff 30%, #57debd 100%);
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
        }
      }
    }
  }
</style>
