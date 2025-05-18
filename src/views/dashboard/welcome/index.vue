<template>
  <div class="welcome-container p-6">
    <!-- 欢迎卡片 -->
    <a-card class="welcome-card mb-6">
      <div class="flex items-center">
        <div class="flex-1">
          <h1 class="text-2xl font-bold mb-2">
            {{ welcomeTime }}，{{ userInfo?.username }}
          </h1>
          <p class="text-gray-600">欢迎使用投诉工单管理系统</p>
        </div>
      </div>
    </a-card>

    <!-- 快速访问区域 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <a-card v-for="(item, index) in quickLinks" :key="index" hoverable @click="handleClick(item.path)">
        <div class="flex items-center">
          <component :is="item.icon" class="text-2xl mr-3" :style="{ color: item.color }" />
          <div>
            <div class="font-medium">{{ item.title }}</div>
            <div class="text-gray-500 text-sm">{{ item.description }}</div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup name="WelcomeDashboard">
  import { useUserStore } from '/@/store/modules/user'
import { router } from '/@/router';
import { ref, computed } from 'vue'
import {
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

// 用户信息
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


// 快速访问链接
const quickLinks = [
  {
    title: '工单处理',
    description: '处理投诉工单',
    icon: FileTextOutlined,
    color: '#52c41a',
    path: '/complain/bizComplaintTicketList'
  },
  {
    title: '运行事态',
    description: '运行事态数据大屏',
    icon: DashboardOutlined,
    color: '#faad14',
    path: '/runtime'
  },
  {
    title: '综合事态',
    description: '综合事态数据大屏',
    icon: DashboardOutlined,
    color: '#ff4d4f',
    path: '/composite'
  }
]

const handleClick = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.welcome-card {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
}

.welcome-card :deep(.ant-card-body) {
  padding: 24px;
}

.welcome-card h1,
.welcome-card p {
  color: white;
  margin: 0;
}
</style> 