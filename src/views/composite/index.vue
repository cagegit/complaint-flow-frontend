<template>
  <div class="composite-box">
    <Header :index="0" />
    <Title title="综合事态" />
  </div>
</template>
<script setup>
  import Header from '@/components/Header/index.vue';
  import Title from '@/components/Title/index.vue';
</script>
<style lang="less" scoped>
  .composite-box {
    width: 100vw;
    height: 100vh;
    background-image: url(@/assets/images/runtime/bg.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
  }
</style>
