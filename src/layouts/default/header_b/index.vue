<template>
    <div class="screen-header" :class="getHeaderClass" :style="getComputedStyle">
      <Header :index="3" :showAvatar="true"/>
    </div>
</template>
<script setup lang="ts">
  import { computed, defineProps } from 'vue';
  //@ts-ignore
  import Header from '/@/components/Header/index.vue';
  import { useAppStore } from "@/store/modules/app";

  const appStore = useAppStore()
  const prefixCls = 'custom-header';

  const props = defineProps({
    fixed: {
      type: Boolean,
      default: false,
    },
  });

  const getComputedStyle = computed(() => {
    const headerHeight = appStore.headerHeight;
    return {
      maxHeight: `${headerHeight}px`,
    };
  });

  const getHeaderClass = computed(() => {
    // const theme = unref(getHeaderTheme);
    return [
        prefixCls,
        {
        [`${prefixCls}--fixed`]: props.fixed,
        },
    ];
 });
</script>
<style lang="less" scoped>
.screen-header {
    background: #082827;
}
 //顶部欢迎语展示样式
//   @prefix-cls: ~'@{namespace}-layout-header';
   .custom-header--fixed {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 500;
        width: 100%;
    }
</style>