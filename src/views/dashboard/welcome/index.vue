<template>
  <div class="welcome-container p-2">
    <div class="welcome-content">
    <!-- 欢迎卡片 -->
    <a-card class="welcome-card mb-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-3 welcome-title">
            {{ welcomeTime }}，{{ userInfo?.username }}
          </h1>
          <p class="text-lg opacity-90 mb-4">
            欢迎回来，开始您今天的工作吧！
          </p>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
              <span>服务运行正常</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
              <span>今日 {{ new Date().toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
        <div class="welcome-icon">
          <div class="icon-wrapper">
            <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
    </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup name="WelcomeDashboard">
import { useUserStore } from '/@/store/modules/user'
import { ref, computed } from 'vue'

const userInfo = ref(useUserStore().getUserInfo)

// 获取问候语
const welcomeTime = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})
</script>

<style scoped>
.welcome-container {
  /* min-height: calc(100vh - var(--global-header-height)); */
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
  height: 100%;
}
.welcome-content {
  padding: 16px;
  background-color: #fff;
  height: 100%;
}

.welcome-card {
  background: linear-gradient(135deg, #4a8080 0%, #095b5b 100%);
  color: white;
  border: none;
  /* border-radius: 16px; */
  /* box-shadow: 0 8px 32px rgba(18, 92, 92, 0.3); */
  overflow: hidden;
  position: relative;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.welcome-card :deep(.ant-card-body) {
  padding: 32px;
  position: relative;
  z-index: 1;
}

.welcome-title {
  background: linear-gradient(45deg, #ffffff, #e0f2f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.welcome-icon {
  opacity: 0.8;
}

.icon-wrapper {
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

.quick-action-card {
  border-radius: 12px;
  border: 1px solid #e8f4f8;
  transition: all 0.3s ease;
  background: white;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(18, 92, 92, 0.15);
  border-color: #125c5c;
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.quick-action-card:hover .action-icon {
  transform: scale(1.1);
  background-color: #125c5c !important;
  color: white !important;
}

.quick-action-card:hover h3 {
  color: #125c5c;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-card :deep(.ant-card-body) {
    padding: 24px;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-icon {
    margin-top: 16px;
    align-self: center;
  }
}
</style>