<template>
  <header class="app-header">
    <nav class="nav-menu">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="{ 'nav-item-select': currentPath === item.path, 'nav-item': true }"
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
      <div v-if="showAvatar" class="avatar-box">
        <UserDropDown :theme="getHeaderTheme" />
      </div>
    </div>
  </header>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import dayjs from 'dayjs';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { UserDropDown } from '/@/layouts/default/header/components';
  const props = defineProps({
    index: {
      type: Number,
      required: false,
    },
    // 展示头像区域
    showAvatar: {
      type: Boolean,
      default: false,
    },
  });

  const { getHeaderTheme } = useHeaderSetting();

  const platformName = '城北街道诉求管理平台';
  const currentTime = ref('');
  const week = ref(new Date().toLocaleDateString('zh-CN', { weekday: 'long' }));
  const date = ref(dayjs().format('YYYY.MM.DD'));
  const currentPath = ref('');

  const navItems = [
    { title: '综合事态', path: '/composite' },
    { title: '运行事态', path: '/runtime' },
    { title: '案件办理', path: '/complain/assign' },
    { title: '知识库', path: '/knowledge/index' },
  ];

  // 更新时间
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
    week.value = now.toLocaleDateString('zh-CN', { weekday: 'long' });
    date.value = dayjs().format('YYYY.MM.DD');
  };

  let timer = ref(null);
  onMounted(() => {
    updateTime();
    timer.value = setInterval(() => {
      updateTime();
    }, 1000);
    const pathname = window.location.pathname;
    currentPath.value = pathname;
  });

  onBeforeUnmount(() => {
    if (timer.value) clearInterval(timer.value);
  });
</script>

<style lang="less" scoped>
  .app-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-image: url(@/assets/images/runtime/header/header-bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    padding: 0 10px; // Add some base horizontal padding
  }

  .title {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: 800;
    font-size: 32px; // Base size
    line-height: 1.5; // Use unitless line-height for better scaling
    letter-spacing: 3px;
    text-align: center; // Ensure it's centered if it wraps
    font-style: normal;
    background: linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #57debd 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-fill-color: transparent;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    // Allow title to shrink and not push other elements too much
    // max-width will be controlled by space between nav and time-box
    // For very small screens, we might need to reduce its width or make it wrap
    // Or even use flexbox for the main layout to allow title to shrink.
    // For now, let's assume font-size reduction is enough.
    white-space: nowrap; // Prevent wrapping for now, adjust font size instead
  }

  .time-box {
    display: flex;
    align-items: center;
    // padding-right: 10px; // Removed, handled by app-header padding
    flex-shrink: 0; // Prevent time-box from shrinking too much

    .current-time {
      height: auto; // Allow height to adjust with font
      font-family: DINAlternate, DINAlternate;
      font-weight: bold;
      font-size: 32px; // Base size
      color: #b9eed9;
      line-height: 1.5; // Use unitless line-height
      letter-spacing: 2px;
      text-align: left;
      font-style: normal;
      white-space: nowrap;
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
      font-size: 12px; // Base size
      color: #b9eed9;
      white-space: nowrap;
      .week,
      .date {
        line-height: 1.3;
      }
    }
    .avatar-box {
      margin-left: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }

  .nav-menu {
    display: flex;
    // overflow: hidden; // Can be problematic if items shrink a lot, but needed for negative margin trick
    align-items: center;
    // padding-left: 32px; // Will be adjusted
    flex-shrink: 0; // Prevent nav-menu from shrinking too much initially
    // min-width: 0; // Allow shrinking below content size for flex items if needed

    .nav-item {
      width: 164px; // Base width
      height: 45px; // Base height
      display: flex;
      justify-content: center;
      align-items: center; // Vertically center text
      font-family: SourceHanSansCN, SourceHanSansCN;
      font-weight: 500;
      font-size: 19px; // Base font size
      color: #b8e2e2;
      // line-height: 43px; // Replaced by align-items: center
      background-image: url(@/assets/images/runtime/header/tab-no-select.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      text-decoration: none;
      margin-left: -32px; // Base margin
      flex-shrink: 0; // Prevent individual items from shrinking disproportionately
      padding: 0 5px; // Add some padding inside the tab for text
      text-align: center;
      white-space: nowrap; // Prevent text wrapping inside tabs
      // &:first-child {
      //   margin-left: 0; // First item doesn't need negative margin
      // }
      &:hover {
        color: #ffffff;
        background-image: url(@/assets/images/runtime/header/tab-hover.png);
        cursor: pointer;
      }
    }

    .nav-item-select {
      // margin-left: -42px; // Base margin
      display: flex;
      justify-content: center;
      align-items: center; // Vertically center text
      background-image: url(@/assets/images/runtime/header/tab-select.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      // line-height: 75px; // Replaced by align-items: center
      color: #ffffff;
      text-shadow: 0px 0px 5px rgba(122, 255, 242, 0.65);
      font-size: 19px; // Base font size
      font-weight: bold;
      font-family: SourceHanSansCN, SourceHanSansCN;
      text-decoration: none;
      flex-shrink: 0; // Prevent individual items from shrinking
      padding: 0 5px; // Add some padding inside the tab for text
      text-align: center;
      white-space: nowrap; // Prevent text wrapping inside tabs
      position: relative; // Ensure it's above other tabs
      z-index: 1;
    }
  }

  // --- Media Queries ---

  // For screens smaller than typical large desktops (e.g., 1600px)
  @media (max-width: 1600px) {
    .title {
      font-size: 28px;
      letter-spacing: 2px;
    }
    .time-box .current-time {
      font-size: 28px;
    }
    .nav-menu {
      // padding-left: 25px;
      .nav-item {
        width: 140px;
        height: 40px;
        font-size: 17px;
        margin-left: -28px;
      }
    }
  }

  // For screens like 1366x768 or smaller laptops
  @media (max-width: 1400px) {
    // Adjusted breakpoint slightly
    .app-header {
      height: 65px;
      padding: 0 8px;
    }
    .title {
      font-size: 24px;
      letter-spacing: 1px;
    }
    .time-box {
      .current-time {
        font-size: 24px;
        letter-spacing: 1px;
      }
      .line {
        height: 28px;
        margin: 0 8px;
      }
      .date-box {
        font-size: 11px;
      }
    }
    .nav-menu {
      // padding-left: 20px;
      .nav-item {
        width: 120px;
        height: 38px;
        font-size: 15px;
        margin-left: -25px;
      }
    }
  }

  // For smaller screens, e.g., 1280px or large tablets
  @media (max-width: 1200px) {
    .app-header {
      height: 60px;
      padding: 0 5px;
    }
    .title {
      font-size: 20px;
      letter-spacing: 1px;
    }
    .time-box {
      .current-time {
        font-size: 20px;
      }
      .line {
        height: 24px;
        margin: 0 6px;
      }
      .date-box {
        font-size: 10px;
      }
      .avatar-box {
        margin-left: 6px;
        // Consider making avatar smaller or hiding if UserDropDown supports it
        transform: scale(0.9);
      }
    }
    .nav-menu {
      // padding-left: 10px;
      .nav-item {
        width: 100px; // Significantly smaller
        height: 35px;
        font-size: 13px;
        margin-left: -20px; // Adjust overlap
        padding: 0 3px;
      }
    }
  }

  // For very small desktop/large tablet screens (e.g., 1024px)
  // At this point, the design becomes very cramped.
  @media (max-width: 1024px) {
    .app-header {
      height: 55px;
    }
    .title {
      font-size: 17px; // Even smaller
      letter-spacing: 0.5px;
    }
    .time-box {
      .current-time {
        font-size: 17px;
      }
      .line {
        height: 20px;
        margin: 0 5px;
      }
      .date-box {
        font-size: 9px;
        // Consider hiding date/week if too cramped, e.g., by display: none;
      }
      .avatar-box {
        margin-left: 5px;
        transform: scale(0.8);
      }
    }
    .nav-menu {
      // padding-left: 5px;
      .nav-item {
        width: 85px;
        height: 32px;
        font-size: 12px;
        margin-left: -18px;
      }
    }
  }

  // Potentially hide elements or drastically change layout for even smaller screens
  // For example, below 800px, you might hide the date/week or even use a hamburger menu.
  // This is a more significant change than just scaling.
  @media (max-width: 860px) {
    // This is getting very tight for this design
    .title {
      font-size: 15px;
      // Potentially allow wrapping if absolutely necessary, but it might look odd with the gradient text
      // white-space: normal;
      // max-width: 150px; // Example, would need careful calculation
    }
    .time-box {
      .current-time {
        font-size: 15px;
      }
      .line,
      .date-box .date {
        // Hide the date part of date-box, keep week
        display: none;
      }
      .date-box .week {
        font-size: 9px;
      }
      .avatar-box {
        margin-left: 5px;
        transform: scale(0.7);
      }
    }
    .nav-menu {
      // If you have 4 nav items, this will be very tight.
      // Consider reducing to 3 items for such small screens or more aggressive styling.
      .nav-item {
        width: 70px;
        height: 30px;
        font-size: 11px;
        margin-left: -15px;
      }
    }
  }
</style>
