<template>
 <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="'是否确认转出选中工单？'"
      :width="800"
      @ok="handleSubmit"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
    >
  <div class="p-4 pl-20">
    <!-- 基本信息区域 -->
    <BasicForm @register="registerForm">
        <!-- 附件 -->
        <template #uploadAttachmentsSlot="{model, field}">
          <UploadList v-model:value="model[field]" :showReplySelectBtn="false" :replyFileList="allReplyFileList" @change="changePreList" @delete="handleDeleteList"/>
        </template>
    </BasicForm>
  </div>
</BasicModal>
</template>
<script setup lang="ts">
    import { ref, defineEmits } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { forwardFormSchema } from './assign.data';
    import { forwardTicket } from '../turn-out/out.api';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { useMessage } from '/@/hooks/web/useMessage';
    // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
      // 声明Emits
    const emit = defineEmits(['success', 'register']);


    const { createMessage } = useMessage();
    const showFooter = ref(true);

    const record = ref<any>({}); // 接收传入的record数据

    let replyFileList:any[] = []; // 用于存储上传的文件列表
    // 全部回复文件列表
    const allReplyFileList = ref<any[]>([]);
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        console.log(data);
        replyFileList = []; // 清空之前的文件列表
        record.value = data.record || {}; // 获取传入的record数据
    });

    //表单配置
    const [registerForm, {validate}] = useForm({
        labelWidth: 100,
        schemas: forwardFormSchema,
        showActionButtonGroup: false,
        layout: 'vertical',
        rowProps: { gutter: 24, justify: 'center', align: 'middle' },
        //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
        baseColProps: { span: 12 },
        //row行的样式
        baseRowStyle: { width: '100%', },
        // 禁用表单
        // disabled: true
    });

    function changePreList(list:any[]) {
      console.log(list);
      replyFileList = list;
    }
    // 删除预回复文件
    function handleDeleteList(file:any) {
      console.log('删除预回复文件', file);
      if (replyFileList.indexOf(file.id) === -1) {
        replyFileList.push(file.id);
      }
    }
   //提交事件
    async function handleSubmit() {
      try {
        let values = await validate();
        setModalProps({ confirmLoading: true });
        // 这里可以添加提交逻辑
        console.log('提交的值:', values);
        console.log(replyFileList);
        // if(replyFileList) {
        //   return;
        // }
        // 模拟提交成功后关闭模态框
        await forwardTicket({ 
            id: record.value.id,
            forwardType: values.forwardType,
            backReason: values.backReason || null,
            adviceOffice: values.adviceOffice || null,
            backType: values.backType || null,
            replyFileList: Array.isArray(replyFileList) ? replyFileList.map(item => {
                return {
                   ...item
                };
            }) : []
        });
        // reload();
        createMessage.success('转出成功');
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',true);
      } catch (error) {
        console.error('表单验证失败:', error);
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
</script>