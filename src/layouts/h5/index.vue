<template>
<div class="h5-layout">
    <!-- h5 has no header -->
    <RouterView>
    </RouterView>
</div>
</template>
<script setup lang="ts">
</script>
<style lang="less">
@maxWidth: 750px;
.h5-layout {
    padding: 20px 20px;
    max-width: @maxWidth;
    margin: 0 auto;
}
</style>
