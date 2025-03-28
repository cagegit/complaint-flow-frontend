<template>
  <div class="app-title">
    <div class="title">
      <div class="text">
        {{ props.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
  });
</script>

<style lang="less" scoped>
  .app-title {
    display: flex;
    align-items: center;
    padding-left: 18px;
    margin-top: 17px;
    justify-content: space-between;
    .title {
      width: 374px;
      height: 57px;
      background-image: url(@/assets/images/runtime/title-bg.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      padding-left: 36px;
      .text {
        font-size: 32px;
        color: #ffffff;
        line-height: 36px;
        text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
        text-align: left;
        background: linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #57debd 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
      }
    }
  }
</style>
