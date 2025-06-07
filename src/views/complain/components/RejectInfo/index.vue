<template>
<div v-bind="attrs" v-if="hasDistrictInfo">
    <a-divider><span class="text-red-500">拒绝信息\区级回复</span></a-divider>
    <a-row :gutter="24" class="py-4">
        <a-col :span="12">
            <div class="flex items-center">
                <div class="text-gray-400">回访结果:</div>
                <div class="pl-2" :class="{ 'text-green-500': visitResult === '双是', 'text-red-500': visitResult !== '双是' }">{{ visitResult }}</div>
            </div>
        </a-col>
        <a-col :span="12">
            <div class="flex items-center">
                <div class="text-gray-400">回访状态:</div>
                <div class="pl-2">{{ visitStatus }}</div>
            </div>
        </a-col>
    </a-row>
     <a-row :gutter="24" class="py-4">
        <a-col :span="24">
            <div class="flex items-center">
                <div class="text-gray-400">最终回复审核内容:</div>
                <div class="pl-2">{{ props.detailInfo.upReplyAuditContent || '无' }}</div>
            </div>
        </a-col>
    </a-row>
     <a-row :gutter="24" class="py-4">
        <a-col :span="24">
            <div class="flex items-center">
                <div class="text-gray-400">区回访内容:</div>
                <div class="pl-2">{{ props.detailInfo.upRevisitContent || '无' }}</div>
            </div>
        </a-col>
    </a-row>
    <a-row :gutter="24" class="py-4">
        <a-col :span="12">
            <div class="flex items-center">
                <div class="text-gray-400">区回访时间:</div>
                <div class="pl-2">{{ props.detailInfo.upRevisitTime || '无' }}</div>
            </div>
        </a-col>
    </a-row>
    <a-divider>基本信息</a-divider>
</div>
</template>
<script setup lang="ts" name="reject-info">
    import { computed, unref, useAttrs } from 'vue';
    
    const attrs = useAttrs();
    // 传参, 工单详情查询返回数据
    const props = defineProps({
        detailInfo: {
            type: Object,
            default: () => ({}),
        },
    });

    // 是否包含区级回复信息
    const hasDistrictInfo = computed(() => {
        const defaultInfo = unref(props.detailInfo);
        if (defaultInfo?.upRevisit === undefined) {
            return false;
        }
        // 如果没有区级回复信息，直接返回false
        return defaultInfo.upRevisit == 1 && defaultInfo.upReplyAudit == 1;
    });
    // 回访结果
    const visitResult = computed(() => {
        const defaultInfo = unref(props.detailInfo);
        if (defaultInfo?.upRevisitResultState === undefined) {
            return '';
        }
        // 如果没有区级回复信息，直接返回空
        switch (defaultInfo?.upRevisitResultState) {
            case 0:
                return '默认';
            case 1:
                return '双是';
            case 2:
                return '双否';
            case 3:
                return '单满';
            case 4:
                return '单解';
            default:
                return '';
        }
    });
    // 回访状态
    const visitStatus = computed(() => {
        const defaultInfo = unref(props.detailInfo);
        if (defaultInfo?.upRevisitState === undefined) {
            return '';
        }
        // 如果没有区级回复信息，直接返回空
        switch (defaultInfo.upRevisitState) {
            case 1:
                return '回访成功';
            case 2:
                return '回访失败';
            case 3:
                return '无效回访';
            case 4:
                return '无法回访';
            default:
                return '';
        }
    });
    // upReplyAuditContent	最终回复审核内容	string	
    // upReplyAuditJson	最终回复审核json内容	string	
    // upRevisit	区是否回访(0未回访;1已回访)	integer(int32)	
    // upRevisitContent	区回访内容	string	
    // upRevisitJson	区回访JSON	string	
    // upRevisitResultState	回访结果类型（0默认;1.双是；2.双否；3.单满；4.单解）	integer(int32)	
    // upRevisitState	回访状态（1.回访成功；2.回访失败；3.无效回访；4.无法回访）	integer(int32)	
    // upRevisitTime	区回访时间	string(date-time)
</script>