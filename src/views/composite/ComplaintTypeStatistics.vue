<template>
  <div class="title">
    <div class="title-left">
      <div class="text">诉件类型分析统计</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <div class="title-right">
      <CaseLabelBox />
      <div style="width: 22px"></div>
      <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
      <div style="width: 12px"></div>
      <Pagination
        v-if="showPagination"
        :currentPage="currentPage"
        :maxPage="Math.ceil(allData.length / pageSize)"
        :onPrevPage="onPrevPage"
        :onNextPage="onNextPage"
      />
    </div>
  </div>
  <div class="chart-container">
    <div class="categories-box">
      <div
        class="categories-item"
        v-for="(item, index) in greenCategories"
        :key="index"
        :style="{
          width: `${item.width}px`,
          backgroundImage: selectedCategory === item.label ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.label ? '100% 112%' : '100% 100%',
          opacity: selectedCategory === item.label ? 1 : 0.8,
        }"
        @click="onCategoryClick(item.label)"
        >{{ item.label }}</div
      >
      <div class="line"></div>
      <div
        class="categories-item"
        v-for="(item, index) in blueCategories"
        :key="index"
        :style="{
          width: `${item.width}px`,
          backgroundImage: selectedCategory === item.label ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.label ? '100% 112%' : '100% 100%',
        }"
        @click="onCategoryClick(item.label)"
        >{{ item.label }}</div
      >
      <div class="line"></div>
      <div
        class="categories-item"
        v-for="(item, index) in yellowCategories"
        :key="index"
        :style="{
          width: `${item.width}px`,
          backgroundImage: selectedCategory === item.label ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.label ? '100% 112%' : '100% 100%',
        }"
        @click="onCategoryClick(item.label)"
        >{{ item.label }}</div
      >
    </div>
    <TimeSwiper :top="96" :startTime="getDayString(startTimeRef)" :endTime="getDayString(endTimeRef)" :onPrev="onRangePrev" :onNext="onRangeNext" />
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  import blockImage from '@/assets/images/dashboard/block.png';
  import { tooltip, YES_PERCENT_COLOR, NO_PERCENT_COLOR, CASE_COLOR, grid, getDayString } from '@/utils/dashboard';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import { getCaseCategoryList, getTimeCycle, getYearCycle } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue/lib';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { RangeTypeEnum, RomplaintTypeTabs, SourceTypeDefault } from '/@/enums/statisticEnum';
  import Pagination from '@/components/Pagination/index.vue';
  import TimeSwiper from '@/components/TimeSwiper/index.vue';
  import blueShort from '@/assets/images/composite/blue-short.png';
  import blueShortSelect from '@/assets/images/composite/blue-short-s.png';
  import greenShortSelect from '@/assets/images/composite/green-short-s.png';
  import greenShort from '@/assets/images/composite/green-short.png';
  import greenLong from '@/assets/images/composite/green-long.png';
  import greenLongSelect from '@/assets/images/composite/green-long-s.png';
  import yellowShort from '@/assets/images/composite/yellow-short.png';
  import yellowShortSelect from '@/assets/images/composite/yellow-short-s.png';
  import yellowLong from '@/assets/images/composite/yellow-long.png';
  import yellowLongSelect from '@/assets/images/composite/yellow-long-s.png';
  import { getDictItems } from '/@/api/common/api';
  import dayjs from 'dayjs';
  const pageSize = 11;
  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

  const currentPage = ref(1);
  const offsetRef = ref(0); // 偏移量
  const sourceTypeRef = ref(SourceTypeDefault); // 来源类型
  const rangeTypeRef = ref(RangeTypeEnum.MONTH); // 时间周期类型
  const startTimeRef = ref(''); // 时间周期类型
  const endTimeRef = ref(''); // 时间周期类型

  const labelNames = ref<string[]>([]);
  const caseCount = ref<number[]>([]); // 诉件数
  const doubleYesRate = ref<number[]>([]); // 双正
  const doubleNoRate = ref<number[]>([]); // 双负

  const selectedCategory = ref('');

  const greenCategories: any = ref([]);
  const blueCategories: any = ref([]);
  const yellowCategories: any = ref([]);

  const showPagination = ref(false);
  const allData = ref([]);

  const onCategoryClick = (value) => {
    console.log('onCategoryClick', value);
    if (selectedCategory.value === value) {
      return;
    }
    selectedCategory.value = value;
    fetchData();
  };

  const onPrevPage = () => {
    console.log('上一页');
    if (currentPage.value === 1) {
      return;
    }
    currentPage.value = currentPage.value - 1;
    getPageData(allData.value);
    initChart();
  };

  const onNextPage = () => {
    console.log('下一页');
    if (currentPage.value === Math.ceil(allData.value.length / pageSize)) {
      return;
    }
    currentPage.value = currentPage.value + 1;
    getPageData(allData.value);
    initChart();
  };

  const onRangePrev = () => {
    console.log('onRangePrev');
    offsetRef.value = offsetRef.value - 1;
    if (rangeTypeRef.value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (rangeTypeRef.value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  // 下一期
  const onRangeNext = () => {
    console.log('onRangeNext');
    offsetRef.value = offsetRef.value + 1;
    if (rangeTypeRef.value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (rangeTypeRef.value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  //   直派、综合
  const onTabChange = (sourceType) => {
    console.log('sourceType', sourceType);
    sourceTypeRef.value = sourceType;
    offsetRef.value = 0;
    fetchData();
  };

  // 期、年
  const onTypeChange = ({ value }) => {
    console.log('onTypeChange', value);
    offsetRef.value = 0;
    rangeTypeRef.value = value;
    if (value === RangeTypeEnum.MONTH) {
      fetchMonthConfig();
    } else if (value === RangeTypeEnum.YEAR) {
      fetchYearConfig();
    }
  };

  const fetchMonthConfig = async () => {
    try {
      const { startTime, endTime }: any = await getTimeCycle({ offset: offsetRef.value });
      startTimeRef.value = startTime;
      endTimeRef.value = endTime;
      fetchData();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const fetchYearConfig = async () => {
    try {
      const { startTime, endTime }: any = await getYearCycle({ offset: offsetRef.value });
      startTimeRef.value = startTime;
      endTimeRef.value = endTime;
      fetchData();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      const maxBarNumber = Math.max(...caseCount.value);
      const interval = 40;
      const max = Math.ceil(maxBarNumber / interval) * interval;

      const option = {
        tooltip,
        grid,
        xAxis: [
          {
            type: 'category',
            data: labelNames.value,
            axisTick: {
              show: false, // 隐藏刻度线
            },
            axisLine: {
              lineStyle: {
                color: '#30665D',
              },
            },
            axisLabel: {
              color: '#B0E1D9',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '诉件数/件',
            axisLine: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
            },
            min: 0,
            max,
            interval,
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '百分比',
            axisLine: {
              show: false,
            },
            min: 0,
            max: 100,
            splitLine: {
              lineStyle: {
                color: 'rgba(110, 112, 121, 0.2)',
              },
            },
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
              align: 'left',
            },
            alignTicks: true,
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: '诉件数',
            type: 'bar',
            barGap: 0,
            data: caseCount.value,
            yAxisIndex: 0,
            barWidth: 16,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: `rgba(${CASE_COLOR.rgbStr}, 0)` },
                  { offset: 1, color: `rgba(${CASE_COLOR.rgbStr}, 0.8)` },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              align: 'right', // 右对齐
              distance: 5,
              formatter: function (params) {
                return `{value|${params.value}}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'right',
                  padding: [0, 5, 4, 0],
                },
                block: {
                  height: 2,
                  width: 16,
                  backgroundColor: {
                    image: blockImage,
                  },
                },
              },
              offset: [8, 5], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双是率',
            type: 'bar',
            data: doubleYesRate.value,
            yAxisIndex: 1,
            barWidth: 16,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: `rgba(${YES_PERCENT_COLOR.rgbStr}, 0)` },
                  { offset: 1, color: `rgba(${YES_PERCENT_COLOR.rgbStr}, 0.8)` },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              align: 'center', // 右对齐
              distance: 5,
              formatter: function (params) {
                return `{value|${params.value}}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'center',
                  padding: [0, 0, 4, 0],
                },
                block: {
                  height: 2,
                  width: 16,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'center',
                },
              },
              offset: [0, 5], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双否率',
            type: 'bar',
            data: doubleNoRate.value,
            yAxisIndex: 1,
            barWidth: 16,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: `rgba(${NO_PERCENT_COLOR.rgbStr}, 0)` },
                  { offset: 1, color: `rgba(${NO_PERCENT_COLOR.rgbStr}, 0.8)` },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              align: 'left', // 右对齐
              distance: 5,
              formatter: function (params) {
                return `{value|${params.value}}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'left',
                  padding: [0, 0, 4, 5],
                },
                block: {
                  height: 2,
                  width: 16,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'left',
                },
              },
              offset: [-8, 5], // 调整标签位置，向上偏移
            },
          },
        ],
      };

      chart.on('mouseout', { dataIndex: 17 }, function () {
        chart?.setOption({
          graphic: [],
        });
      });

      chart.setOption(option);
    }
  };

  const getPageData = (data: any) => {
    const newCaseCount: number[] = [];
    const newDoubleYesRate: number[] = [];
    const newDoubleNoRate: number[] = [];
    const newLabelNames: string[] = [];
    if (currentPage.value === 1) {
      data = allData.value.slice(0, pageSize);
    } else {
      data = allData.value.slice(pageSize * (currentPage.value - 1), pageSize * currentPage.value);
    }
    data.forEach((item: any) => {
      newCaseCount.push(item.caseCount);
      newDoubleYesRate.push(item.doubleYes);
      newDoubleNoRate.push(item.doubleNo);
      newLabelNames.push(item.labelName);
    });
    labelNames.value = newLabelNames.map(v => dayjs(v).format('MM-DD')); // 格式化日期为 MM-DD
    caseCount.value = newCaseCount; // 诉件数
    doubleYesRate.value = newDoubleYesRate; // 双是
    doubleNoRate.value = newDoubleNoRate; // 双否
  };

  const fetchData = async () => {
    let parmas: any = {
      sourceType: sourceTypeRef.value,
      rangeType: rangeTypeRef.value,
      startTime: startTimeRef.value,
      endTime: endTimeRef.value,
      categoryName: selectedCategory.value,
    };
    try {
      const res: any = await getCaseCategoryList(parmas);
      allData.value = res;
      currentPage.value = 1;
      if (res.length > pageSize) {
        showPagination.value = true;
      } else {
        showPagination.value = false;
      }
      getPageData(res);
      initChart();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const getCaseCategoryEnumList = async () => {
    try {
      const res: any = await getDictItems('biz_case_category');
      const newGreenCategories: any = [];
      const newBlueCategories: any = [];
      const newYellowCategories: any = [];
      res.forEach((item: any) => {
        if (item.color === '#00C345') {
          newGreenCategories.push({
            label: item.text,
            value: item.value,
            bg: item.text.length > 4 ? greenLong : greenShort,
            selectedBg: item.text.length > 4 ? greenLongSelect : greenShortSelect,
            width: item.text.length > 4 ? 128 : 90,
          });
        } else if (item.color === '#2196F3') {
          newBlueCategories.push({
            label: item.text,
            value: item.value,
            bg: blueShort,
            selectedBg: blueShortSelect,
            width: item.text.length > 2 ? 90 : 56,
          });
        } else if (item.color === '#FF9300') {
          newYellowCategories.push({
            label: item.text,
            value: item.value,
            bg: item.text.length > 4 ? yellowLong : yellowShort,
            selectedBg: item.text.length > 4 ? yellowLongSelect : yellowShortSelect,
            width: item.text.length > 4 ? 128 : 90,
          });
        }
      });
      selectedCategory.value = newGreenCategories[0].label;
      greenCategories.value = newGreenCategories;
      blueCategories.value = newBlueCategories;
      yellowCategories.value = newYellowCategories;
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  const refreshData = () => {
    fetchMonthConfig();
    getCaseCategoryEnumList();
  };

  onMounted(() => {
    fetchMonthConfig();
    getCaseCategoryEnumList();
    window.addEventListener('resize', () => {
      chart?.resize();
    });
    // 监听刷新数据事件
    window.addEventListener('refresh-runtime-data', refreshData);
  });

  onBeforeUnmount(() => {
    chart?.dispose();
    window.removeEventListener('resize', () => {});
    window.removeEventListener('refresh-runtime-data', refreshData);
  });
</script>

<style scoped lang="less">
  .title {
    width: 100%;
    height: 42px;
    background-image: url(@/assets/images/composite/title-bg.png);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10px;

    .title-left {
      display: flex;
      align-items: center;

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
        margin-right: 20px;
      }
    }
    .title-right {
      display: flex;
      align-items: center;
    }
  }
  .chart-container {
    position: relative;
    padding-top: 12px;
    width: 100%;
    height: calc(100% - 100px);
  }

  .categories-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .categories-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
      font-size: 14px;
      height: 38px;
      color: #e0fcf6;
      cursor: pointer;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      margin-right: 2px;

      &:hover {
        opacity: 1 !important;
      }
    }

    .line {
      width: 1px;
      height: 28px;
      border: 1px solid #55c0a9;
      margin-right: 2px;
    }
  }
</style>
