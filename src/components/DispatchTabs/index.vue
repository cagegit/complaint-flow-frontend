<template>
  <div class="tab-list">
    <div
      :class="{
        'tab-left': true,
        active: currentValue === 2,
      }"
      @click="onClick(2)"
      ><text class="tab-text">直派</text></div
    >
    <div
      :class="{
        'tab-right': true,
        active: currentValue === -1,
      }"
      @click="onClick(-1)"
      ><text class="tab-text">综合</text></div
    >
  </div>
</template>
<script setup>
  import { ref } from 'vue';
  const currentValue = ref(2);

  const props = defineProps({
    onTabChange: {
      type: Function,
      default: () => {},
    },
  });

  const onClick = (value) => {
    if (currentValue.value === value) {
      return;
    }
    console.log('currentValue', value);
    currentValue.value = value;
    props.onTabChange(value);
  };
</script>
<style lang="less" scoped>
  .tab-list {
    display: flex;
    align-items: center;
    height: 40px;
    .tab-left,
    .tab-right {
      width: 80px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: SourceHanSansCN, SourceHanSansCN;
      font-weight: 400;
      font-size: 16px;
      color: #81aea4;
      cursor: pointer;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      &:hover {
        color: #ffffff;
      }
      &.active {
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
    .tab-left {
      background-image: url(@/assets/images/runtime/tab-left.png);
      padding-right: 20px;
      margin-right: -30px;
      &.active {
        background-image: url(@/assets/images/runtime/tab-left-select.png);
      }
    }
    .tab-right {
      padding-left: 20px;
      background-image: url(@/assets/images/runtime/tab-right.png);
      &.active {
        background-image: url(@/assets/images/runtime/tab-right-select.png);
      }
    }
  }
</style>
