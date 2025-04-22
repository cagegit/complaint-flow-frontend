<template>
  <div class="title">
    <div class="title-left">
      <div class="text">群诉案件分析</div>
      <DispatchTabs :onTabChange="onTabChange" />
    </div>
    <div class="title-right">
      <CaseLabelBox />
      <div style="width: 24px"></div>
      <CustomTabs :data="RomplaintTypeTabs" :onTabChange="onTypeChange" />
    </div>
  </div>
  <div class="chart-container">
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import blockImage from '@/assets/images/dashboard/block.png';
  import { CASE_COLOR, YES_PERCENT_COLOR, NO_PERCENT_COLOR, tooltip, calculateDynamicYAxis, grid } from '@/utils/dashboard';
  import CaseLabelBox from '@/components/CaseLabelBox/index.vue';
  import CustomTabs from '@/components/CustomTabs/index.vue';
  import DispatchTabs from '@/components/DispatchTabs/index.vue';
  import { getQunsuList } from '@/api/complaint/statistic';
  import { message } from 'ant-design-vue';
  import { RomplaintTypeTabs, SourceTypeEnum } from '/@/enums/statisticEnum';

  const chartRef = ref(null);
  let chart: echarts.EChartsType | null = null;

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);

      // 数据抽离
      const categories = Array.from({ length: 15 }, (_, i) => (i + 1).toString());
      const barData = [173, 117, 125, 103, 40, 124, 173, 117, 115, 103, 172, 124, 125, 103, 172];
      const doubleYesRate = [96, 89, 95, 87, 95, 83, 96, 89, 95, 87, 95, 83, 95, 87, 95]; // 百分比
      const doubleNoRate = [28, 32, 32, 13, 24, 16, 32, 13, 31, 27, 29, 36, 48, 52, 10];

      const { max, interval } = calculateDynamicYAxis(barData, 10);

      const option = {
        tooltip,
        grid,
        xAxis: [
          {
            type: 'category',
            data: categories,
            boundaryGap: true,
            barCategoryGap: '50%',
            axisLine: {
              lineStyle: {
                color: '#30665D',
              },
            },
            axisTick: {
              show: false, // 隐藏刻度线
            },
            splitLine: {
              show: false,
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
            min: 0,
            max,
            interval,
            nameTextStyle: {
              color: '#B0E1D9',
              fontSize: 14,
              padding: [0, 0, 10, 0],
            },
            axisLabel: {
              color: '#B0E1D9',
              formatter: '{value}',
            },
          },
          {
            type: 'value',
            name: '百分比',
            axisLine: { lineStyle: { color: '#ccc' } },
            min: 0,
            max: 100,
            interval: 10,
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
            data: barData,
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
                  { offset: 1, color: `rgba(${CASE_COLOR.rgbStr}, 0.7)` },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              color: '#fff',
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
                  width: 14,
                  backgroundColor: {
                    image: blockImage,
                  },
                  align: 'center',
                },
              },
              offset: [0, 6], // 调整标签位置，向上偏移
            },
          },
          {
            name: '双是率',
            type: 'line',
            yAxisIndex: 1,
            data: doubleYesRate,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            max: 100,
            itemStyle: {
              color: YES_PERCENT_COLOR.rgb,
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              color: '#fff',
            },
          },
          {
            name: '双否率',
            type: 'line',
            yAxisIndex: 1,
            data: doubleNoRate,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            max: 100,
            itemStyle: {
              color: NO_PERCENT_COLOR.rgb,
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              color: '#fff',
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

  const onTabChange = (sourceType) => {
    console.log('sourceType', sourceType);
  };

  const onTypeChange = (a) => {
    console.log('onTypeChange', a);
  };

  const fetchData = async ({ sourceType }) => {
    let parmas = {};
    if (sourceType > 0) {
      parmas = { sourceType };
    }
    try {
      const res: any = await getQunsuList(parmas);
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    }
  };
  onMounted(() => {
    fetchData({
      sourceType: SourceTypeEnum.DIRECT,
    });
    initChart();
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
</style>
