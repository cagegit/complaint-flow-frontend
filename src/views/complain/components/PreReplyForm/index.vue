<template>
<BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="'预回复'"
      :width="900"
      @ok="handleSubmit"
      @cancel="handleClose"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
    >
    <div class="pl-18">
         <BasicForm @register="registerForm">
           <template #satisfactionTimeSlot="{model, field}">
             <a-space>
               <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
               <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
             </a-space>
           </template>
           <template #contactTimeSlot="{model, field}">
             <a-space>
               <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
               <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
             </a-space>
           </template>
            <template #resolutionTimeSlot="{model, field}">
             <a-space>
               <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
               <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
             </a-space>
           </template>
           <!-- 附件 -->
            <template #uploadAttachmentsSlot="{model, field}">
             <UploadList v-model:value="model[field]" />
             </template>
         </BasicForm>
    </div>
</BasicModal>
</template>
<script lang="ts" setup name="PreReplayForm">
    import { ref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema } from './preReplyForm.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { savePreReply, getPreReplyDetail } from './preReplyForm.api';
    import { useMessage } from '/@/hooks/web/useMessage';
    // @ts-ignore
    import UploadList from '../UploadList/index.vue';
    const { createMessage } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
    const showFooter = ref(true);
    //表单配置
    const [registerForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
      labelWidth: 150,
      schemas: formSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
    // 区级promise resolve方法
    let qjResolve:any = null;
    //表单赋值
    const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
      await resetFields();
      // console.log(data);
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      qjResolve = data.resolve;
      // 查询区级回复详情数据
      try {
        const res = await getPreReplyDetail({ ticketId: data.record.id });
        console.log(res);
        if(res) {
          let fileList:any = [];
          // 附件列表
          if (Array.isArray(res.handleFileList)) {
            fileList = res.handleFileList.map((item:any) => {
              return {
                uid: item.id,
                name: item.fileName,
                status: 'done',
                url: item.fileKey,
                response: item, // 保留原始数据
              };
            });
          }
          // 表单内容
          if(res.upReply) {
            setFieldsValue({
              ...res,
              attachments: fileList,
            });
          }
        }
      } catch (error) {
        console.error('获取预回复详情失败:', error);
      }
    
      //update-end---author:wangshuai ---date:20230522  for：【issues/4935】租户用户编辑界面中租户下拉框未过滤，显示当前系统所有的租户------------
      // 无论新增还是编辑，都可以设置表单值
      // if (typeof data.record === 'object') {
      //   setFieldsValue({
      //     ...data.record,
      //   });
      // }
    }); 
    //表单提交
    async function handleSubmit() {
      const data = await validate();
      console.log(data);
      if (data) {
       setModalProps({ confirmLoading: true });
       try{
          if(data.satisfactionTime === ',') {
            data.satisfactionTime = '';
          } 
          if(data.contactTime === ',') {
            data.contactTime = '';
          }
          if(data.resolutionTime === ',') {
            data.resolutionTime = '';
          }
          // 附件
          delete data.addFileList;
          const res = await savePreReply(data);
          console.log(res);
          if (res.code === 200) {
            createMessage.success('操作成功');
            closeModal();
            emit('success', res);
          }
        } catch (error) {
          console.error('获取预回复详情失败:', error);
        }
        setModalProps({ confirmLoading: false });
      } else {
        createMessage.error('请填写完整信息!');
      }
      // 区级回调
      qjResolve?.('submit');
    }
    // 关闭弹窗
    function handleClose() {
      qjResolve?.('close');
      closeModal();
    }
</script>