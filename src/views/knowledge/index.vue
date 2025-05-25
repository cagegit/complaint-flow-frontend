<template>
  <div class="knowledge-page">
    <div class="knowledge-container">
      <div class="knowledge-content">
        <div class="tab-container">
          <div class="tabs">
            <div
              v-for="(tabItem, index) in tabList1"
              :key="index"
              :class="['tab-item', { active: activeTab1 === index }]"
              @click="setActiveTab1(index)"
            >
              {{ tabItem.name }}
            </div>
            <div class="policy-more" @click="viewMore(tabList1[activeTab1].type)">
              <div class="policy-more-text">更多</div>
              <div class="arrow-right"></div>
            </div>
          </div>
          <div class="tab-content">
            <transition :name="transitionName" mode="out-in">
              <div v-show="true">
                <div class="policy-list" :key="activeTab1">
                  <template v-if="!isLegacyEmpty">
                    <div v-for="(item, index) in policiesData.classic_cases" :key="index" class="policy-item" @click="toDetailPage(item)">
                      <div class="policy-title">{{ item.title }}</div>
                      <div class="policy-date">{{ item.date }}</div>
                    </div>
                  </template>
                  <a-empty v-else />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="search-sidebar">
        <div class="search-title">经典案例展示</div>
      </div>
    </div>
    <div class="knowledge-container">
      <!-- 2 -->
      <div class="knowledge-content">
        <div class="tab-container">
          <div class="tabs">
            <div v-for="(tabItem, index) in tabs" :key="index" :class="['tab-item', { active: activeTab === index }]" @click="setActiveTab(index)">
              {{ tabItem.name }}
            </div>
            <div class="policy-more" @click="viewMore(tabs[activeTab].type)">
              <div class="policy-more-text">更多</div>
              <div class="arrow-right"></div>
            </div>
          </div>
          <div class="tab-content">
            <transition :name="transitionName" mode="out-in">
              <div v-show="true">
                <div class="policy-list" :key="activeTab">
                  <template v-if="!isCurrentPolicyEmpty">
                    <div v-for="(item, index) in currentPolicyList" :key="index" class="policy-item" @click="toDetailPage(item)">
                      <div class="policy-title">{{ item.title }}</div>
                      <div class="policy-date">{{ item.date }}</div>
                    </div>
                  </template>
                  <a-empty v-else />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="search-sidebar-1">
        <div class="search-title">政策查询与解读</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="KnowledgePage">
  import { ref, computed, onMounted } from 'vue';
  import { router } from '/@/router';
  import { getPageList, getDeptList } from '/@/api/complaint/knowledge';

  interface PolicyItem {
    id: number;
    title: string;
    date: string;
    content?: string;
    type?: number;
  }

  interface PolicyData {
    single_department: PolicyItem[];
    single_area: PolicyItem[];
    laws_regulations: PolicyItem[];
    classic_cases: PolicyItem[];
    [key: string]: PolicyItem[];
  }

  const activeTab = ref(0);
  const prevTab = ref(0);

  const activeTab1 = ref(0);
  const prevTab1 = ref(0);
  const transitionName = ref('slide-right');

  const tabList1 = ref([{ name: '经典案例', key: 'classic_cases', type: '3' }]);
  const tabs = ref([
    { name: '单派科室', key: 'single_department', type: '1' },
    { name: '单派管区', key: 'single_area', type: '2' },
    { name: '法律法规', key: 'laws_regulations', type: '4' },
  ]);

  // 为每个标签页准备不同的数据
  const policiesData = ref<PolicyData>({
    single_department: [],
    single_area: [],
    laws_regulations: [],
    classic_cases: [],
  });

  // 获取知识库列表数据
  const fetchKnowledgeData = async (type = '3', category = 'classic_cases') => {
    console.log('fetchKnowledgeData', type, category);
    try {
      const params = {
        type,
        pageNum: 1,
        pageSize: 6,
        sort: '1', // 倒序
      };
      const res: any = await getPageList(params);
      console.log('res', res);
      // 格式化数据
      const formattedData = res.records.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.createTime ? new Date(item.createTime as any).toLocaleDateString() : '',
        content: item.content,
        type: item.type,
      }));
      policiesData.value[category] = formattedData;
    } catch (error) {
      console.error('获取知识库数据失败:', error);
    }
  };

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

    // 加载对应标签的数据
    fetchKnowledgeData(tabs.value[index].type, tabs.value[index].key);
  };

  const setActiveTab1 = (index: number) => {
    if (index === activeTab1.value) return;

    // 根据切换方向设置动画效果
    transitionName.value = index > activeTab1.value ? 'slide-left' : 'slide-right';

    // 更新tab状态
    prevTab1.value = activeTab1.value;
    activeTab1.value = index;

    // 加载经典案例数据
    fetchKnowledgeData(tabList1.value[index].type, tabList1.value[index].key);
  };

  // 添加查看更多方法
  const viewMore = (type: string) => {
    router.push({
      path: `/knowledge/manager`,
      query: { type },
    });
  };

  const toDetailPage = (item: PolicyItem) => {
    console.log('toDetailPage', item);
    router.push({
      path: `/knowledge/detail`,
      query: { id: item.id.toString() || '1' },
    });
  };

  // 初始化数据
  onMounted(() => {
    // 加载经典案例数据
    fetchKnowledgeData(tabList1.value[activeTab1.value].type, tabList1.value[activeTab1.value].key);
    // 加载政策文件数据
    fetchKnowledgeData(tabs.value[activeTab.value].type, tabs.value[activeTab.value].key);
  });

  // Add computed properties for empty states
  const isLegacyEmpty = computed(() => !policiesData.value.classic_cases?.length);
  const isCurrentPolicyEmpty = computed(() => !currentPolicyList.value?.length);
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
          position: relative;
          align-items: center;

          .tab-item {
            padding: 12px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            border-bottom: 2px solid transparent;

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
          min-height: 400px;
          overflow: hidden;

          .policy-list {
            width: 100%;
            position: relative;
            min-height: 400px;

            .ant-empty {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
            }

            .policy-item {
              display: flex;
              justify-content: space-between;
              padding: 16px 10px;
              border-bottom: 1px solid #f0f0f0;

              &:hover {
                background-color: #f9f9f9;
                cursor: pointer;
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
    .search-sidebar-1 {
      width: 360px;
      // background-color: #f9f9f9;
      // border-radius: 4px;
      overflow: hidden;
      background: #0c3c3a url('../../assets/images/zhengce.jpg') no-repeat center center;
      background-size: 100% auto;
      padding: 0 0.25rem;
      border: 0.025rem solid #f9f3ea;
      border-radius: 0.075rem;
      .search-title {
        padding: 15px 20px;
        font-size: 20px;
        font-weight: bold;
         display: none;
        // border-bottom: 1px solid #e8e8e8;
      }
    }

    .search-sidebar {
      width: 360px;
      // background-color: #f9f9f9;
      // border-radius: 4px;
      overflow: hidden;
      background: #0c3c3a url('../../assets/images/jindian.jpg') no-repeat center center;
      background-size: 100% auto;
      padding: 0 0.25rem;
      border: 0.025rem solid #f9f3ea;
      border-radius: 0.075rem;

      .search-title {
        padding: 15px 20px;
        font-size: 20px;
        font-weight: bold;
        display: none;
        // border-bottom: 1px solid #e8e8e8;
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
      cursor: pointer;
      color: @main-bg;
      transition: all 0.2s;
      position: absolute;
      right: 20px;
      top: 15px;

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
