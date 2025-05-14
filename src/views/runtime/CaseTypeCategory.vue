<template>
  <div class="category-box">
    <div class="title">
      <div class="text">案件性质分类</div>
    </div>
    <div class="category-list">
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/normal-icon.png" alt="" />
        <div class="category-info">
          <div class="name">普通案件</div>
          <div class="count">{{ data.normalCase.value }}</div>
          <div class="comparison">
            <div>环比</div>
            <img v-if="data.normalCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.normalCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.normalCase.percent || 0 }}%</div>
          </div>
        </div>
      </div>
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/enterprise-icon.png" alt="" />
        <div class="category-info">
          <div class="name">企业案件</div>
          <div class="count">{{ data.enterpriseCase.value }}</div>
          <div class="comparison">
            <div>环比</div>
            <img v-if="data.enterpriseCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.enterpriseCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.enterpriseCase.percent || 0 }}%</div>
          </div>
        </div>
      </div>
      <div class="category-item">
        <img class="category-icon" src="@/assets/images/runtime/category/group-icon.png" alt="" />
        <div class="category-info">
          <div class="name">群诉案件</div>
          <div class="count">{{ data.groupCase.value }}</div>
          <div class="comparison" v-if="!isNaN(data.groupCase.percent) && data.groupCase.percent !== null">
            <div>环比</div>
            <img v-if="data.groupCase.status === 1" class="percent-icon" src="@/assets/images/runtime/category/up-icon.png" alt="" />
            <img v-else-if="data.groupCase.status === 2" class="percent-icon" src="@/assets/images/runtime/category/down-icon.png" alt="" />
            <div>{{ data.groupCase.percent || 0 }}%</div>
          </div>
        </div>
      </div>
    </div>
    <div style="height: 20px"></div>
    <div class="title">
      <div class="text">排名</div>
      <CustomTabs :data="tabs" :onTabChange="onTabChange" />
    </div>
    <div style="display: flex; flex: 1; align-items: center; justify-content: center" v-if="ranking.length === 0">
      <EmptyState />
    </div>
    <template v-else>
      <div style="margin: 10px">
        <LabelBox />
      </div>
      <div class="ranking-list">
        <div class="ranking-item" v-for="(item, index) in ranking" :key="item.orgId">
          <div class="ranking-top">
            <img v-if="index === 0" class="top" :src="top1" alt="" />
            <img v-else-if="index === 1" class="top" :src="top2" alt="" />
            <img v-else-if="index === 2" class="top" :src="top3" alt="" />
            <div v-else class="top">{{ index + 1 }}</div>
            <div class="name">
              <div class="name-up">{{ item.orgName }}</div>
              <div class="name-down">
                <div class="name-down-label">诉件数</div>
                <div>{{ item.caseCount }}</div>
              </div>
            </div>
            <div class="progres">
              <Progress :progress="item.doubleYes" start-color="rgba(125, 249, 218, 0)" end-color="rgba(133, 255, 224, 0.70)" showUnit />
              <Progress :progress="item.doubleNo" start-color="rgba(255, 132, 71, 0)" end-color="rgba(255, 119, 51, 1)" showUnit />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Progress from '@/components/Progress/index.vue';
  import top1 from '@/assets/images/runtime/ranking/top1.png';
  import top2 from '@/assets/images/runtime/ranking/top2.png';
  import top3 from '@/assets/images/runtime/ranking/top3.png';
  import LabelBox from '@/components/LabelBox/index.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import { message } from 'ant-design-vue';
  import { getCaseNatureCount, getDeptRankList } from '@/api/complaint/statistic';
  import { calculateYoY } from '@/utils/dashboard';
  import { UnitTypeEnum, UnitTypeNameMap } from '@/enums/statisticEnum';
  import EmptyState from '@/components/EmptyState/index.vue';

  const tabs = ref([
    {
      label: UnitTypeNameMap[UnitTypeEnum.DEPT],
      value: UnitTypeEnum.DEPT,
    },
    {
      label: UnitTypeNameMap[UnitTypeEnum.AREA],
      value: UnitTypeEnum.AREA,
    },
    {
      label: UnitTypeNameMap[UnitTypeEnum.COMMUNITY],
      value: UnitTypeEnum.COMMUNITY,
    },
  ]);

  console.log('tabs', tabs);

  const ranking = ref<{ orgId: number; orgName: string; doubleNo: number; doubleYes: number; caseCount: number }[]>([]);

  const currentIndex = ref(UnitTypeEnum.DEPT);

  const data = ref({
    normalCase: {
      value: 0,
      percent: 0,
      status: 0,
    },
    enterpriseCase: {
      value: 0,
      percent: 0,
      status: 0,
    },
    groupCase: {
      value: 0,
      percent: 0,
      status: 0,
    },
  });
  console.log(data);

  onMounted(() => {
    fetchData();
    fetchRanking({
      deptType: UnitTypeEnum.DEPT,
    });
  });

  const onTabChange = ({ value }) => {
    currentIndex.value = value;
    fetchRanking({
      deptType: value,
    });
  };

  const fetchData = async () => {
    try {
      const res: any = await getCaseNatureCount({});
      console.log('endRes', res);
      const normalPercent = calculateYoY(res.normalCount, res.lastNormalCount, 0);
      const enterprisePercent = calculateYoY(res.enterpriseCount, res.lastEnterpriseCount, 0);
      const groupCasePercent = calculateYoY(res.groupCount, res.lastGroupCount, 0);
      data.value = {
        normalCase: {
          value: res.normalCount,
          percent: Math.abs(normalPercent),
          status: normalPercent > 0 ? 1 : 2,
        },
        enterpriseCase: {
          value: res.enterpriseCount,
          percent: Math.abs(enterprisePercent),
          status: enterprisePercent > 0 ? 1 : 2,
        },
        groupCase: {
          value: res.groupCount,
          percent: Math.abs(groupCasePercent),
          status: groupCasePercent > 0 ? 1 : 2,
        },
      };
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const fetchRanking = async (params) => {
    try {
      const res: any = await getDeptRankList(params);
      ranking.value = res;
      console.log('res', res);
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
      // 错误时设置为空数组，显示空状态
      ranking.value = [];
    }
  };
</script>

<style lang="less" scoped>
  .category-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    .title {
      width: 100%;
      height: 42px;
      background-image: url(@/assets/images/runtime/overview/title.png);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 10px;
      .text {
        font-size: 20px;
        color: #ffffff;
        line-height: 40px;
        text-shadow: 0px 0px 8px rgba(100, 244, 255, 0.9);
        text-align: left;
        background: linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #57debd 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
        padding-left: 35px;
      }
    }
    .category-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 10px;
      width: 100%;
      margin-top: 17px;
      .category-item {
        height: 106px;
        background-image: url(@/assets/images/runtime/category/category-bg.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        padding-left: 10px;
      }
      .category-icon {
        width: 56px;
        height: 56px;
        display: block;
      }
      .category-info {
        display: flex;
        flex-direction: column;
        font-weight: 400;
        font-size: 14px;
        color: #e4fff9;
        .name {
          font-weight: 400;
          font-size: 16px;
          color: #ffffff;
        }
        .count {
          font-size: 24px;
          color: #ffffff;
          margin-top: 8px 0;
        }
        .comparison {
          display: flex;
          align-items: center;

          .percent-icon {
            width: 9px;
            height: 11px;
            margin: 0 4px;
          }
        }
      }
    }
    .ranking-list {
      width: 100%;
      margin-top: 10px;
      overflow-y: auto;
      flex: 1;

      .ranking-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        background-size: 100% 100%;
        background-repeat: no-repeat;

        &:nth-child(odd) {
          background-image: url(@/assets/images/runtime/ranking/category-bg.png);
        }

        &:hover {
          cursor: pointer;
          background-image: url(@/assets/images/runtime/ranking/top_hover.png);
        }

        .ranking-top {
          display: flex;
          align-items: center;
          width: 100%;
          height: 70px;
          margin-left: -10px;
          .top {
            width: 56px;
            height: 58px;
            font-weight: 400;
            font-size: 14px;
            color: #e4fff9;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .name {
            max-width: 172px;
            display: flex;
            flex-direction: column;

            .name-up {
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              font-weight: 400;
              font-size: 16px;
              color: #ffffff;
            }

            .name-down {
              display: flex;
              align-items: center;
              margin-top: 10px;
              font-weight: 400;
              font-size: 14px;
              color: #ffffff;
              .name-down-label {
                margin-right: 9px;
                color: #b0e1d9;
              }
            }
          }

          .progres {
            flex: 1;
            height: 100%;
            padding: 6px 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
        }
      }

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #398b79;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-track {
        background: #0e3d3c;
      }
    }
  }
</style>
