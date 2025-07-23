<template>
  <div class="overflow-auto">
    <a-table 
    :size="'small'" 
    :pagination="false" 
    :dataSource="dataSource" 
    :columns="columns" 
    :scroll="{ y: maxHeight }"
    />
  </div>
</template>
<script setup lang="ts">
    import { ref, defineProps, watch} from 'vue';
    const props = defineProps({
        jsonStr: {
            type: String,
            default: ''
        },
        columns: {
            type: Array,
            default: () => []
        },
        maxHeight: {
            type: Number,
            default: 300
        }
    });
   const dataSource = ref([]);
  // const columns = ref([]);

    watch(() => props.jsonStr, (newVal, oldVal) => {
    if (newVal !== oldVal && newVal) {
        try {
        // 尝试解析 JSON 字符串
        dataSource.value = JSON.parse(newVal);
        } catch (error) {
            console.error('JSON 解析错误:', error);
            dataSource.value = [];
        }
    }
    }, { immediate: true });
</script>