<template>
  <div class="knowledge-page">
    <div class="knowledge-container">
       <!-- 1 -->
      <div class="knowledge-content">
        <div class="tab-container">
          <div class="tabs">
            <div 
              v-for="(tab, index) in tabList1" 
              :key="index" 
              :class="['tab-item', { active: activeTab1 === index }]"
              @click="setActiveTab1(index)"
              @mouseenter="setActiveTab1(index)"
            >
              {{ tab.name }}
            </div>
          </div>
          <div class="tab-content">
            <transition :name="transitionName" mode="out-in">
              <div>
                <div class="policy-list" :key="activeTab1">
                  <div 
                    v-for="(item, index) in policiesData.documents" 
                    :key="index" 
                    class="policy-item"
                    @click="toDetailPage(item)"
                  >
                    <div class="policy-title">{{ item.title }}</div>
                    <div class="policy-date">{{ item.date }}</div>
                  </div>
                </div>
                <!-- 更多按钮 -->
                <div class="policy-more" @click="viewMore(tabList1[activeTab1].key)">
                  <div class="policy-more-text">更多</div>
                  <div class="arrow-right"></div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      
      <div class="search-sidebar">
        <div class="search-title">经典案例展示</div>
        <!-- <div class="search-panel">
          <div class="search-filter">
            <div class="filter-label">主题分类</div>
            <div class="filter-select">
              <span>全部</span>
              <i class="arrow-down"></i>
            </div>
          </div>
          <div class="search-buttons">
            <div class="search-btn primary">查找政策</div>
            <div class="search-btn secondary">高级查询</div>
          </div>
          <div class="policy-database">
            <div class="database-title">北京市政策文件库</div>
            <div class="arrow-right"></div>
          </div>
        </div> -->
      </div>
    </div>
  <div class="knowledge-container">
     
      <!-- 2 -->
      <div class="knowledge-content">
        <div class="tab-container">
          <div class="tabs">
            <div 
              v-for="(tab, index) in tabs" 
              :key="index" 
              :class="['tab-item', { active: activeTab === index }]"
              @click="setActiveTab(index)"
              @mouseenter="setActiveTab(index)"
            >
              {{ tab.name }}
            </div>
          </div>
          <div class="tab-content">
            <transition :name="transitionName" mode="out-in">
              <div>
                <div class="policy-list" :key="activeTab">
                  <div 
                    v-for="(item, index) in currentPolicyList" 
                    :key="index" 
                    class="policy-item"
                    @click="toDetailPage(item)"
                  >
                    <div class="policy-title">{{ item.title }}</div>
                    <div class="policy-date">{{ item.date }}</div>
                  </div>
                </div>
                <!-- 更多按钮 -->
                <div class="policy-more" @click="viewMore(tabs[activeTab].key)">
                  <div class="policy-more-text">更多</div>
                  <div class="arrow-right"></div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      
      <div class="search-sidebar">
        <div class="search-title">政策查询与解读</div>
        <!-- <div class="search-panel">
          <div class="search-filter">
            <div class="filter-label">主题分类</div>
            <div class="filter-select">
              <span>全部</span>
              <i class="arrow-down"></i>
            </div>
          </div>
          <div class="search-buttons">
            <div class="search-btn primary">查找政策</div>
            <div class="search-btn secondary">高级查询</div>
          </div>
          <div class="policy-database">
            <div class="database-title">北京市政策文件库</div>
            <div class="arrow-right"></div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="knowledge">
import { ref, computed } from 'vue';
import { router } from '/@/router';
const activeTab = ref(0);
const prevTab = ref(0);

const activeTab1 = ref(0);
const prevTab1 = ref(0);
const transitionName = ref('slide-right');

const tabList1 = ref([
  { name: '经典案例', key: 'legacy' },
]);
const tabs = ref([
  { name: '政策文件', key: 'documents' },
  { name: '政策解读', key: 'interpretations' },
  { name: '政策性文件意见征集', key: 'opinions' }
]);

// 为每个标签页准备不同的数据
const policiesData = ref({
  documents: [
    {
      title: '昌平区教育委员会关于2025年义务教育阶段入学工作意见',
      date: '2025-04-28'
    },
    {
      title: '北京市昌平区人民政府办公室 关于印发《全面推进美丽昌平建设 持续深入打好污染防治攻坚战实施方案》的通知',
      date: '2025-03-28'
    },
    {
      title: '2024—2026年北京市昌平区农机购置与应用补贴实施细则',
      date: '2025-02-20'
    },
    {
      title: '关于印发《昌平区农村自备井供水水费管理办法》的通知',
      date: '2025-02-13'
    },
    {
      title: '北京市昌平区农业服务中心关于昌平区林下栗蘑种植补贴和关于优质草莓种苗保障分项实施方案',
      date: '2025-01-23'
    },
    {
      title: '北京市昌平区人民政府办公室关于印发《昌平区2025年重要民生实事项目分工方案》的通知',
      date: '2025-01-20'
    }
  ],
  interpretations: [
    {
      title: '解读《昌平区2025-2026年教育发展规划》重点内容',
      date: '2025-04-18'
    },
    {
      title: '《昌平区农业补贴政策》解读与实施细则说明',
      date: '2025-03-15'
    },
    {
      title: '昌平区环保政策解读：绿色发展与生态保护',
      date: '2025-02-25'
    },
    {
      title: '深度理解：昌平区大数据产业政策支持方向',
      date: '2025-01-30'
    }
  ],
  opinions: [
    {
      title: '关于《昌平区城市更新与历史文化保护规划》的意见征集',
      date: '2025-05-10'
    },
    {
      title: '昌平区教育培训机构管理办法（草案）意见征集',
      date: '2025-04-05'
    },
    {
      title: '关于《昌平区新能源汽车推广应用管理办法》的公开征求意见',
      date: '2025-03-01'
    }
  ]
});

// 根据当前激活标签显示对应数据
const currentPolicyList = computed(() => {
  const key = tabs.value[activeTab.value].key;
  return policiesData.value[key] || [];
});

const setActiveTab = (index: number) => {
  if (index === activeTab.value) return;
  
  // 根据切换方向设置动画效果
  transitionName.value = index > activeTab.value ? 'slide-left' : 'slide-right';
  
  // 更新tab状态
  prevTab.value = activeTab.value;
  activeTab.value = index;
};

const setActiveTab1 = (index: number) => {
  if (index === activeTab1.value) return;
  
  // 根据切换方向设置动画效果
  transitionName.value = index > activeTab1.value ? 'slide-left' : 'slide-right';
  
  // 更新tab状态
  prevTab1.value = activeTab1.value;
  activeTab1.value = index;
};

// 添加查看更多方法
const viewMore = (category: string) => {
  console.log(`查看更多 ${category} 内容`);
  // 这里可以添加导航到详情页面或加载更多内容的逻辑
  // 例如: router.push(`/knowledge/${category}`)
  router.push(
    {
      path: `/knowledge/manager`,
      query: { category }
    }
  )
};

const toDetailPage = (item: any) => {
  console.log('toDetailPage', item);
  // router.push({ name: 'knowledge-detail', params: { id: item.id } });
  router.push(
    {
      path: `/knowledge/detail`,
      query: { id: item.id || '1' }
    }
  );
};
</script>
<style lang="less" scoped>
@main-bg: #0c3c3a;
// @main-bg: #082827;
// @main-bg-light: #f9f9f9;
@main-bg-dark: #061c1b;
.knowledge-page {
  padding: 20px;
  // min-height: 100vh;
  padding-top: 82px;
}
.knowledge-container {
  display: flex;
  padding: 20px;
  gap: 20px;
  background-color: #fff;
  
  .knowledge-content {
    flex: 1;
    
    .tab-container {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;
      
      .tabs {
        display: flex;
        background-color: #f9f9f9;
        border-bottom: 1px solid #e8e8e8;
        
        .tab-item {
          padding: 12px 20px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          
          &.active {
            color: @main-bg;
            font-weight: bold;
            border-bottom: 2px solid @main-bg;
          }
          
          &:hover:not(.active) {
            color: @main-bg-dark;
          }
        }
      }
      
      .tab-content {
        padding: 15px;
        min-height: 400px; // 设置一个最小高度，避免内容切换时高度变化导致的布局抖动
        overflow: hidden; // 确保内容不溢出
        
        .policy-list {
          width: 100%;
          
          .policy-item {
            display: flex;
            justify-content: space-between;
            padding: 16px 10px;
            border-bottom: 1px solid #f0f0f0;
            
            &:hover {
              background-color: #f9f9f9;
            }
            
            .policy-title {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .policy-date {
              color: #999;
              margin-left: 20px;
            }
          }
        }
      }
    }
  }
  
  // 左右滑动动画效果
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.2s ease;
  }
  
  // 向左滑动（新内容从右侧进入）
  .slide-left-enter-from {
    transform: translateX(100%);
  }
  .slide-left-leave-to {
    transform: translateX(-100%);
  }
  
  // 向右滑动（新内容从左侧进入）
  .slide-right-enter-from {
    transform: translateX(-100%);
  }
  .slide-right-leave-to {
    transform: translateX(100%);
  }
  
  // 淡入淡出动画效果（保留，以防需要）
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .search-sidebar {
    width: 360px;
    // background-color: #f9f9f9;
    // border-radius: 4px;
    overflow: hidden;
    background: #fffbf6 url('../../assets/images/zccxbg.png') no-repeat top center;
    background-size: 100% auto;
    padding: 0 0.25rem;
    border: 0.025rem solid #f9f3ea;
    border-radius: 0.075rem;
    
    .search-title {
      padding: 15px 20px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid #e8e8e8;
    }
    
    .search-panel {
      padding: 20px;
      
      .search-filter {
        margin-bottom: 20px;
        
        .filter-label {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .filter-select {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 15px;
          border: 1px solid #e8e8e8;
          background-color: #fff;
          border-radius: 4px;
          
          .arrow-down {
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #999;
          }
        }
      }
      
      .search-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        
        .search-btn {
          flex: 1;
          padding: 12px 0;
          text-align: center;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          
          &.primary {
            background-color: @main-bg;
            color: white;
          }
          
          &.secondary {
            background-color: @main-bg;
            color: white;
          }
        }
      }
      
      .policy-database {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 10px;
        border-top: 1px solid #e8e8e8;
        cursor: pointer;
        
        .database-title {
          font-size: 16px;
          font-weight: bold;
        }
        
        .arrow-right {
          width: 8px;
          height: 8px;
          border-top: 2px solid #999;
          border-right: 2px solid #999;
          transform: rotate(45deg);
        }
      }
    }
  }
  // 屏幕小于 1024px，search-sidebar 隐藏
  @media (max-width: 1024px) {
    .search-sidebar {
      display: none;
    }
  }
  // 添加更多按钮样式
  .policy-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 10px;
    margin-top: 8px;
    cursor: pointer;
    color: @main-bg;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f9f9f9;
    }
    
    .policy-more-text {
      font-size: 14px;
      margin-right: 5px;
    }
    
    .arrow-right {
      width: 8px;
      height: 8px;
      border-top: 1px solid @main-bg;
      border-right: 1px solid @main-bg;
      transform: rotate(45deg);
      margin-top: 2px;
    }
  }
}
</style>