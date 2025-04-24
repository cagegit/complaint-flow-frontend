<template>
  <div class="title">
    <div class="title-left">
      <div class="text">诉讼类型分析统计</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <div class="title-right">
      <CaseLabelBox />
      <div style="width: 22px"></div>
      <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
      <div style="width: 12px"></div>
      <Pagination :currentPage="currentPage" :maxPage="2" :onPrevPage="onPrevPage" :onNextPage="onNextPage" />
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
          height: selectedCategory === item.value ? '38px' : '34px',
          backgroundImage: selectedCategory === item.value ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.value ? '100% 112%' : '100% 100%',
          opacity: selectedCategory === item.value ? 1 : 0.8,
        }"
        @click="onCategoryClick(item.value)"
        >{{ item.label }}</div
      >
      <div class="line"></div>
      <div
        class="categories-item"
        v-for="(item, index) in blueCategories"
        :key="index"
        :style="{
          width: `${item.width}px`,
          height: selectedCategory === item.value ? '38px' : '34px',
          backgroundImage: selectedCategory === item.value ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.value ? '100% 112%' : '100% 100%',
        }"
        @click="onCategoryClick(item.value)"
        >{{ item.label }}</div
      >
      <div class="line"></div>
      <div
        class="categories-item"
        v-for="(item, index) in yellowCategories"
        :key="index"
        :style="{
          width: `${item.width}px`,
          height: selectedCategory === item.value ? '38px' : '34px',
          backgroundImage: selectedCategory === item.value ? `url(${item.selectedBg})` : `url(${item.bg})`,
          backgroundSize: selectedCategory === item.value ? '100% 112%' : '100% 100%',
        }"
        @click="onCategoryClick(item.value)"
        >{{ item.label }}</div
      >
    </div>
    <TimeSwiper :top="96" :startTime="getDayString(startTimeRef)" :endTime="getDayString(endTimeRef)" :onPrev="onRangePrev" :onNext="onRangeNext" />
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import blockImage from '@/assets/images/dashboard/block.png';
  import { tooltip, YES_PERCENT_COLOR, NO_PERCENT_COLOR, CASE_COLOR, grid, getDayString } from '@/utils/dashboard';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import { getCaseCategoryList, getTimeCycle, getYearCycle } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue/lib';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { RangeTypeEnum, RomplaintTypeTabs, SourceTypeEnum } from '/@/enums/statisticEnum';
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

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

  const currentPage = ref(1);
  const offsetRef = ref(0); // 偏移量
  const sourceTypeRef = ref(SourceTypeEnum.DIRECT); // 来源类型
  const rangeTypeRef = ref(RangeTypeEnum.MONTH); // 时间周期类型
  const startTimeRef = ref(''); // 时间周期类型
  const endTimeRef = ref(''); // 时间周期类型

  const labelNames = ref<string[]>([]);
  const caseCount = ref<number[]>([]); // 诉件数
  const doubleYesRate = ref<number[]>([]); // 双正
  const doubleNoRate = ref<number[]>([]); // 双负

  const selectedCategory = ref(1);

  const greenCategories = [
    { label: '社会秩序', value: 1, bg: greenShort, selectedBg: greenShortSelect, width: 90 },
    { label: '交通管理', value: 2, bg: greenShort, selectedBg: greenShortSelect, width: 90 },
    { label: '公共安全', value: 3, bg: greenShort, selectedBg: greenShortSelect, width: 90 },
    { label: '公共服务', value: 4, bg: greenShort, selectedBg: greenShortSelect, width: 90 },
    { label: '农村管理', value: 5, bg: greenShort, selectedBg: greenShortSelect, width: 90 },
    { label: '邮政业服务管理', value: 6, bg: greenLong, selectedBg: greenLongSelect, width: 128 },
  ];
  const blueCategories = [
    { label: '环境保护', value: 7, bg: blueShort, selectedBg: blueShortSelect, width: 90 },
    { label: '市政', value: 8, bg: blueShort, selectedBg: blueShortSelect, width: 56 },
    { label: '市容市貌', value: 9, bg: blueShort, selectedBg: blueShortSelect, width: 90 },
    { label: '城市绿化', value: 10, bg: blueShort, selectedBg: blueShortSelect, width: 90 },
    { label: '城乡建设', value: 11, bg: blueShort, selectedBg: blueShortSelect, width: 90 },
    { label: '供暖', value: 12, bg: blueShort, selectedBg: blueShortSelect, width: 56 },
    { label: '住房', value: 13, bg: blueShort, selectedBg: blueShortSelect, width: 56 },
  ];
  const yellowCategories = [
    { label: '民政事务', value: 14, bg: yellowShort, selectedBg: yellowShortSelect, width: 90 },
    { label: '妇女权益', value: 15, bg: yellowShort, selectedBg: yellowShortSelect, width: 90 },
    { label: '卫生健康', value: 16, bg: yellowShort, selectedBg: yellowShortSelect, width: 90 },
    { label: '劳动和社会保障', value: 17, bg: yellowLong, selectedBg: yellowLongSelect, width: 128 },
    { label: '企业服务', value: 18, bg: yellowShort, selectedBg: yellowShortSelect, width: 90 },
    { label: '物业管理', value: 19, bg: yellowShort, selectedBg: yellowShortSelect, width: 90 },
  ];

  const onCategoryClick = (value) => {
    selectedCategory.value = value;
  };

  const onPrevPage = () => {
    console.log('上一页');
    currentPage.value = 1;
  };

  const onNextPage = () => {
    console.log('下一页');
    currentPage.value = 2;
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
            barWidth: 10,
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
                  padding: [0, 2, 4, 0],
                },
                block: {
                  height: 2,
                  width: 12,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'right',
                },
              },
              offset: [5, 6], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双是率',
            type: 'bar',
            data: doubleYesRate.value,
            yAxisIndex: 1,
            barWidth: 10,
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
                return `{value|${params.value}%}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'center',
                  padding: [0, 0, 4, 0],
                },
                block: {
                  height: 2,
                  width: 10,
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
            barWidth: 10,
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
                return `{value|${params.value}%}\n{block|}`;
              },
              rich: {
                value: {
                  color: '#fff',
                  align: 'left',
                  padding: [0, 0, 4, 0],
                },
                block: {
                  height: 2,
                  width: 12,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'left',
                },
              },
              offset: [-5, 5], // 调整标签位置，向上偏移
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

  const fetchData = async () => {
    let parmas: any = {
      sourceType: sourceTypeRef.value,
      rangeType: rangeTypeRef.value,
      startTime: startTimeRef.value,
      endTime: endTimeRef.value,
    };
    try {
      const res: any = await getCaseCategoryList(parmas);
      const newCaseCount: number[] = [];
      const newDoubleYesRate: number[] = [];
      const newDoubleNoRate: number[] = [];
      const newLabelNames: string[] = [];
      res.forEach((item: any) => {
        newCaseCount.push(item.caseCount);
        newDoubleYesRate.push(item.doubleYes);
        newDoubleNoRate.push(item.doubleNo);
        newLabelNames.push(item.labelName);
      });
      labelNames.value = newLabelNames;
      caseCount.value = newCaseCount; // 诉件数
      doubleYesRate.value = newDoubleYesRate; // 双是
      doubleNoRate.value = newDoubleNoRate; // 双否
      initChart();
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };

  onMounted(() => {
    fetchMonthConfig();
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
    height: 100%;
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
