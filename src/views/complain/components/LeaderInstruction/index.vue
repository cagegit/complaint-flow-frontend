<template>
    <div class="flex flex-col mb-4">
      <!-- 书记批示区域 -->
      <div class="flex flex-col items-end">
          <a-textarea
          v-model:value="shuJiContent"
          :placeholder="'书记批示内容'"
          :disabled="!isShuJi || readOnly"
          :rows="4"
          autoresize
          class="mb-4"
          >
            <template #prefix>
              <a-icon icon="ant-design:message-outlined" />
            </template>
          </a-textarea>
          <a-button
            type="primary"
            @click="submitShuJiContent"
            v-if="isShuJi && !readOnly"
            style="width: 120px;"
          >
            书记批示
          </a-button>
        </div>
      <!-- 主任批示区域 -->
      <div class="mb-4 flex flex-col items-end">
        <a-textarea 
        v-model:value="zhuRenContent" 
        :placeholder="'主任批示内容'" 
        :disabled="!isZhuRen || readOnly"
        :rows="4"
        autoresize
        class="mb-4"
        >
          <template #prefix>
            <a-icon icon="ant-design:message-outlined" />
          </template>
        </a-textarea>
        <a-button
          type="primary"
          @click="submitZhuRenContent"
          v-if="isZhuRen && !readOnly"
          style="width: 120px;"
        >
          主任批示
        </a-button>
      </div>
    </div>
</template>
<script lang="ts" name="leader-instruction" setup>
  import { ref, defineProps, computed, watch } from 'vue';
  import { shujiSuggest, zhurenSuggest } from '../../assign/assign.api'
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  const props = defineProps(
    {
      ticketId: {
        type: [String, Number],
        required: true
      },
      zrContent: {
        type: String,
        default: ''
      },
      sjContent: {
        type: String,
        default: ''
      },
      readOnly: {
        type: Boolean,
        default: false
      }
    }
  )
  // 主任批示内容
  const zhuRenContent = ref(props.zrContent);
  // 书记批示内容
  const shuJiContent = ref(props.sjContent);

  // 增加watch
  watch(() => props.zrContent, (newVal) => {
    zhuRenContent.value = newVal;
  });
  
  watch(() => props.sjContent, (newVal) => {
    shuJiContent.value = newVal;
  }); 

  const { createMessage } = useMessage();
  const { hasPermission } = usePermission();

  

  const isZhuRen = computed(() => hasPermission('complain:assign:zhuren_suggest'));
  const isShuJi = computed(() => hasPermission('complain:assign:shuji_suggest'));

    // 提交主任批示
    const submitZhuRenContent = () => {
        if (!zhuRenContent.value.trim()) {
            createMessage.error('请填写主任批示内容');
            return;
        }
        zhurenSuggest({
            complaintId: props.ticketId,
            suggest: zhuRenContent.value
        }).then(() => {
            createMessage.success('主任批示提交成功');
            // zhuRenContent.value = ''; // 清空内容
        }).catch((error) => {
            console.error('提交主任批示失败:', error);
            createMessage.error('提交失败，请稍后再试');
        });
    }
    // 提交书记批示
    const submitShuJiContent = () => {
        if (!shuJiContent.value.trim()) {
            createMessage.error('请填写书记批示内容');
            return;
        }
        shujiSuggest({
            complaintId: props.ticketId,
            suggest: shuJiContent.value
        }).then(() => {
            createMessage.success('书记批示提交成功');
            // shuJiContent.value = ''; // 清空内容
        }).catch((error) => {
            console.error('提交书记批示失败:', error);
            createMessage.error('提交失败，请稍后再试');
        });
    }
</script>