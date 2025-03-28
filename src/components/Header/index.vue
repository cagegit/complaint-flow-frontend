<template>
  <header class="app-header">
    <nav class="nav-menu">
      <router-link
        v-for="(item, navIndex) in navItems"
        :key="item.path"
        :to="item.path"
        :class="{ 'nav-item-select': props.index === navIndex, 'nav-item': props.index !== navIndex }"
        active-class="active"
      >
        {{ item.title }}
      </router-link>
    </nav>
    <div class="title">
      {{ platformName }}
    </div>

    <div class="time-box">
      <span class="current-time">{{ currentTime }}</span>
      <span class="line"></span>
      <div class="date-box">
        <div class="week">{{ week }}</div>
        <div class="date">{{ date }}</div>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps({
    index: {
      type: Number,
      required: false,
    },
  });

  const platformName = '城北街道诉求管理平台';
  const currentTime = ref('');
  const week = ref(new Date().toLocaleDateString('zh-CN', { weekday: 'long' }));
  const date = ref(dayjs().format('YYYY.MM.DD'));

  const navItems = [
    { title: '综合事态', path: '/composite' },
    { title: '运行事态', path: '/runtime' },
    { title: '案件办理', path: '/' },
    { title: '案件管理', path: '/' },
  ];

  // 更新时间
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
    week.value = now.toLocaleDateString('zh-CN', { weekday: 'long' });
    date.value = dayjs().format('YYYY.MM.DD');
  };

  let timer = null;

  onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
  });

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });
</script>

<style lang="less" scoped>
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-image: url(@/assets/images/runtime/header/header-bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .title {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: 800;
    font-size: 32px;
    line-height: 48px;
    letter-spacing: 3px;
    text-align: left;
    font-style: normal;
    background: linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #57debd 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .time-box {
    display: flex;
    align-items: center;
    padding-right: 30px;

    .current-time {
      height: 46px;
      font-family: DINAlternate, DINAlternate;
      font-weight: bold;
      font-size: 32px;
      color: #b9eed9;
      line-height: 46px;
      letter-spacing: 2px;
      text-align: left;
      font-style: normal;
    }

    .line {
      width: 1px;
      height: 32px;
      background-color: #b9eed9;
      margin: 0 10px;
    }

    .date-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      font-size: 12px;
      color: #b9eed9;
    }
  }

  .nav-menu {
    display: flex;
    overflow: hidden;
    align-items: center;
    padding-left: 32px;

    .nav-item {
      width: 164px;
      height: 45px;
      display: flex;
      justify-content: center;
      font-family: SourceHanSansCN, SourceHanSansCN;
      font-weight: 500;
      font-size: 19px;
      color: #b8e2e2;
      line-height: 43px;
      background-image: url(@/assets/images/runtime/header/tab-no-select.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      text-decoration: none;
      margin-left: -32px;
      &:hover {
        color: #ffffff;
        background-image: url(@/assets/images/runtime/header/tab-hover.png);
        cursor: pointer;
      }
    }

    .nav-item-select {
      margin-left: -42px;
      width: 175px;
      height: 85px;
      display: flex;
      justify-content: center;
      background-image: url(@/assets/images/runtime/header/tab-select.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      line-height: 75px;
      color: #ffffff;
      text-shadow: 0px 0px 5px rgba(122, 255, 242, 0.65);
      color: #ffffff;
      font-size: 19px;
      font-weight: bold;
      font-family: SourceHanSansCN, SourceHanSansCN;
      text-decoration: none;
      margin-top: 7px;
    }
  }
</style>
