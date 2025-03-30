<template>
  <div class="label-box">
    <div class="label-item mr20">
      <div class="icon1"></div>
      <div>案件数量</div>
    </div>
    <div class="label-item">
      <div class="icon2"></div>
      <div>满意率</div>
    </div>
  </div>
</template>
<style lang="less" scoped>
  .label-box {
    display: flex;
    align-items: center;
    .mr20 {
      margin-right: 20px;
    }
    .label-item {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #b0e1d9;
      .icon1 {
        width: 8px;
        height: 8px;
        background: #48ffd2;
        margin-right: 8px;
        border-radius: 50%;
      }
      .icon2 {
        width: 8px;
        height: 8px;
        background: #ff8447;
        margin-right: 8px;
        border-radius: 50%;
      }
    }
  }
</style>
