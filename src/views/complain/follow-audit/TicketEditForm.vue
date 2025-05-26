<template>
    <BasicModal
      v-bind="$attrs"
      @register="registerDrawer"
      :title="getTitle"
      :width="900"
      @ok="handleSubmit"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
    >
      <div class="flex px-3">
        <div style="flex: 1">
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="回访审核" force-render>
              <div class="pl-20">
                 <a-divider orientation="left">审核内容</a-divider>
                  <BasicForm @register="registerAuditForm"/>
                 <a-divider orientation="left">预回复</a-divider>
                 <BasicForm @register="registerPreReplyForm">
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
                    <UploadList v-model="model[field]" />
                    </template>
                </BasicForm>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="基础信息" force-render>
               <!-- 拒绝信息 -->
               <RejectInfo :detailInfo="ticketDetail" />
               <!-- 基本信息区域 -->   
               <BasicForm @register="registerForm"/>
            </a-tab-pane>
            <a-tab-pane key="3" tab="回复记录" force-render>
              <div class="pr-4">
                  <ReplyRecord 
                    :replyData="replyList" 
                    :total="total" 
                    :readOnly="true"
                  />
                </div>
             </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, auditFormSchema } from './follow-audit.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { saveReviewReply, getReplyDetail } from './follow-audit.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
      // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    // @ts-ignore
    import { formFinalSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    //@ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    import { useMessage } from '/@/hooks/web/useMessage';

    const { createMessage } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    // let isFormDepartUser = false;
    const replyList = ref<any[]>([]);
    const total = ref(0);
    // 当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 表单详情
    const ticketDetail = ref<any>({});
    // 预回复表单
    const [registerPreReplyForm, { validate: validatePreReplyForm }] = useForm({
      labelWidth: 150,
      schemas: preReplyFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 12 },
      //row行的样式
      baseRowStyle: { width: '100%', }
    });
    //基础信息表单配置
    const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: formSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 12 },
      //row行的样式
      baseRowStyle: { width: '100%', },
      disabled: true
    });
    //回访审核表单配置
    const [registerAuditForm, { validate:validateAuditForm }] = useForm({
      labelWidth: 150,
      schemas: auditFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
    // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
    const showFooter = ref(true);
    //表单赋值
    const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
      await resetFields();
      console.log(data);
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      try {
        const res = await getReplyDetail({ ticketId: data.record.id });
        console.log(res);
        if(res) {
          // 处理文件数据
        let newFileList = res?.replyList?.map((v:any) => {
            v.fileCount = 0;
            v.imageCount = 0;
            v.audioCount = 0;
            v.fileList?.forEach(item => {
              // console.log('item', item);
              // item.fileCount = (item.fileCount || 0) + 1;
              let fileType = item.fileName.split('.').pop();
              if (['mp3', 'wav','m4a'].includes(fileType)) {
                v.audioCount++;
              } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
                v.imageCount++;
              } else {
                v.fileCount++;
              }
          });
          return {
           ...v
          };
        }) || [];
         replyList.value = newFileList;
         total.value = res.replyList?.length || 0;
        }
      } catch (error) {
        console.error('Error fetching reply list:', error);
      }
  
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        let detailRes:any = {};
        try {
          detailRes = await getComplaintDetail(data.record.id);
          ticketDetail.value = detailRes;
        } catch (error) {
          console.log(error);
        }
        setFieldsValue({
          ...data.record,
          ...detailRes
        });
      }
    });
    //获取标题
    const getTitle = computed(() => {
      return '回访审核';
    });
    const { adaptiveWidth } = useDrawerAdaptiveWidth();
  
    //提交事件
    async function handleSubmit() {
      try {
        // 审核表单
        let auditValues = await validateAuditForm();
        // 预回复表单
        let preReplyValues = await validatePreReplyForm();
        console.log('auditValues', auditValues);
        console.log('preReplyValues', preReplyValues);
        // 先验证回访审核表单
        let values = await validate();
        setModalProps({ confirmLoading: true });
        
        // 判断附件是否存在
        let newFileList:any[] = [];
        if (!preReplyValues?.attachments) {
          createMessage.error('请上传附件');
          setModalProps({ confirmLoading: false });
          throw new Error('请上传附件');
        } else {
           try{
             const list = JSON.parse(preReplyValues.attachments);
             newFileList = list;
           } catch(err) {
            console.error('Error uploading attachments:', err);
           }   
        }

        let isUpdateVal = unref(isUpdate);
        let params = values;
        const ticketId = currentEditRecordRef.value?.id;
        const newParams = {
          "auditStatus": auditValues.auditStatus,
          "deleteFileIdList": [],
          "finalResolveResult": auditValues.finalResolveResult,
          "followCode": auditValues.followCode,
          "labelCode": params.labelCode,
          "needVisit":  auditValues.needVisit,
          "rejectReason": auditValues.rejectReason,
          "remark": auditValues.remark,
          "replyFileList": [
            // ...replyList.value,
            ...newFileList
          ],
          "sevenFiveId": params.sevenFiveId ? params.sevenFiveId.split(',').pop() : '',
          // "ticketId": 0,
          "ticketReplyDataVo": {
            ...preReplyValues,
            replyRequestName: preReplyValues.replyRequestType
          },
          "ticketId": ticketId
        };
        //提交表单
        await saveReviewReply(newParams);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{isUpdateVal ,values});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
  </script>
  