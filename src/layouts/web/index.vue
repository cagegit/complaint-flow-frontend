<template>
    <div class="custom-layout">
       <!-- header -->
        <LayoutHeader fixed />
        <RouterView>
        </RouterView>
    </div>
</template>
<script lang="ts" setup>
 console.log('web layout+++++++++++++++++++++++++++++');
 // @ts-ignore
 import LayoutHeader from '../default/header_b/index.vue';
</script>