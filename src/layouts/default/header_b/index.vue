<template>
    <div class="screen-header" :class="getHeaderClass">
      <Header :index="3" :showAvatar="true"/>
    </div>
</template>
<script setup lang="ts">
  import { computed, defineProps } from 'vue';
  //@ts-ignore
  import Header from '/@/components/Header/index.vue';
  const prefixCls = 'custom-header';

  const props = defineProps({
    fixed: {
      type: Boolean,
      default: false,
    },
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