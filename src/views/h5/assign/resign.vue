<template>
  <div class="p-0">
    <div style="width: 100%; overflow: auto; padding: 20px 15px">
      <!-- 基本信息区域 -->
      <BasicForm @register="registerForm">
        <!-- 附件 -->
        <template #uploadAttachmentsSlot="{ model, field }">
          <UploadList
            v-model:value="model[field]"
            :showReplySelectBtn="false"
            :replyFileList="allReplyFileList"
            @change="changePreList"
            @delete="handleDeleteList"
          />
        </template>
      </BasicForm>
    </div>
    <!-- 底部按钮 停靠在底部 -->
    <div class="flex justify-between mt-4 gap-2 fixed bottom-0 left-0 right-0 bg-white p-4">
      <a-button block @click="closeModal">关闭</a-button>
      <a-button type="primary" block :loading="confirmLoading" @click="handleSubmit">提交</a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, defineEmits } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { forwardFormSchema } from '/@/views/complain/assign/assign.data';
  import { forwardTicket } from '/@/views/complain/turn-out/out.api';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  // @ts-ignore
  import UploadList from '/@/views/complain/components/UploadList/index.vue';
  import { useRoute } from 'vue-router';
  // 声明wx小程序web-view 对象
  declare const wx: any;
  const route = useRoute();

  const { createMessage } = useMessage();
  const showFooter = ref(true);

  function closeModal() {
    // 关闭当前页面,发送数据给打开页面并返回
    try {
      if (wx?.miniProgram) {
        wx?.miniProgram?.navigateBack?.();
      } else {
        // 如果是h5页面，直接关闭
        window?.history?.back?.();
      }
    } catch (err) {
      console.log(err);
    }
  }
  const record = ref<any>({}); // 接收传入的record数据

  let replyFileList: any[] = []; // 用于存储上传的文件列表
  // 全部回复文件列表
  const allReplyFileList = ref<any[]>([]);
  const [registerModal] = useModalInner(async (data) => {
    console.log(data);
    replyFileList = []; // 清空之前的文件列表
    record.value = data.record || {}; // 获取传入的record数据
  });

  //表单配置
  const [registerForm, { validate }] = useForm({
    labelWidth: 100,
    schemas: forwardFormSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 12 },
    //row行的样式
    baseRowStyle: { width: '100%' },
    // 禁用表单
    // disabled: true
  });
  const confirmLoading = ref(false);

  function changePreList(list: any[]) {
    console.log(list);
    replyFileList = list;
  }
  // 删除预回复文件
  function handleDeleteList(file: any) {
    console.log('删除预回复文件', file);
    if (replyFileList.indexOf(file.id) === -1) {
      replyFileList.push(file.id);
    }
  }
  //提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      confirmLoading.value = true;
      // 这里可以添加提交逻辑
      console.log('提交的值:', values);
      console.log(replyFileList);
      // if(replyFileList) {
      //   return;
      // }
      // 模拟提交成功后关闭模态框
      await forwardTicket({
        id: route.query.id,
        forwardType: values.forwardType,
        backReason: values.backReason || null,
        adviceOffice: values.adviceOffice || null,
        backType: values.backType || null,
        replyFileList: Array.isArray(replyFileList)
          ? replyFileList.map((item) => {
              return {
                ...item,
              };
            })
          : [],
      });
      // reload();
      createMessage.success('转出成功');
      //关闭弹窗
      closeModal();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      confirmLoading.value = false;
    }
  }
</script>
