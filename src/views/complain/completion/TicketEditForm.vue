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
            <!-- <BasicForm @register="registerForm"/> -->
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="基础信息" force-render>
               <!-- 拒绝信息 -->
               <RejectInfo :detailInfo="ticketDetail" />
               <!-- 基本信息区域 -->
               <BasicForm @register="registerForm"/>
                <!-- 领导批示区域 -->
               <LeaderInstruction
                v-if="ticketDetail.id"
                :ticketId="ticketDetail.id"
                :zrContent="ticketDetail.zhurenSuggest"
                :sjContent="ticketDetail.shujiSuggest"
                :readOnly="true"
                :style="{width: '89%'}"
               />
            </a-tab-pane>
            <a-tab-pane key="2" tab="预回复" force-render>
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
                  <UploadList v-model:value="model[field]" :read-only="true" />
                </template>
              </BasicForm>
            </a-tab-pane>
           
          </a-tabs>
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema } from './completion.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { saveReviewReply, getReplyDetail } from './completion.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
    // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    // @ts-ignore
    import { preFormLogicHandler, formFinalNoRequiredSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    import { getPreReplyDetail } from '../components/PreReplyForm/preReplyForm.api';
     // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { defaultSpan } from '../shareInfo';
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
    // 当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
     // 表单详情
    const ticketDetail = ref<any>({});
    //预回复表单
    const [registerPreReplyForm, {setProps, setFieldsValue: setPreReplyFieldValues, updateSchema: preReplyUpdateSchema}] = useForm({
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
    const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: formSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: defaultSpan },
      //row行的样式
      baseRowStyle: { width: '100%', },
      disabled: true
    });
    // //预回复表单
    // const [registerPreReplyForm] = useForm({
    //   labelWidth: 150,
    //   schemas: addFormSchema,
    //   showActionButtonGroup: false,
    //   layout: 'vertical',
    //   rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    //   //row行的样式
    // });
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
      const res = await getReplyDetail({ ticketId: data.record.id });
      console.log(res);
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        let detailRes:any = {};
        try {
          detailRes = await getComplaintDetail(data.record.id);
          ticketDetail.value = {
            ...res,
            ...detailRes,
          };
        } catch (error) {
          console.log(error);
        }
        setFieldsValue({
          ...data.record,
          ...detailRes
        });
      }
      // 查询预回复详情
      getPreReplyDetail({ticketId: data.record?.id}).then(preRes => {
        console.log(preRes);
        if(preRes?.upReply) {
          // 设置预回复表单值
          setPreReplyFieldValues({
            ...preRes.upReply,
            replySatisfiedTime: preRes.upReply.replySatisfiedTime ? preRes.upReply.replySatisfiedTime.split(',') : [],
            replyContactTime: preRes.upReply.replyContactTime ? preRes.upReply.replyContactTime.split(',') : [],
            replyResolveTime: preRes.upReply.replyResolveTime ? preRes.upReply.replyResolveTime.split(',') : [],
            // 增加对级联字段的处理
            replyRequestType: preRes.upReply.replyRequestType ? preRes.upReply.replyRequestType.split(',') : [],
            lastOfficeId: preRes.upReply.lastOfficeId ? preRes.upReply.lastOfficeId.split(',') : [],
            whistleDepartmentId: preRes.upReply.whistleDepartmentId ? preRes.upReply.whistleDepartmentId.split(',') : [],
            removeHangingAccountsTypeId: preRes.upReply.removeHangingAccountsTypeId ? preRes.upReply.removeHangingAccountsTypeId.split(',') : [],
            attachments: Array.isArray(preRes.handleFileList) ? preRes.handleFileList : []
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, preReplyUpdateSchema);
        }
      }).catch(err => {
        console.error('查询预回复详情失败', err);
      });
      // 禁用预回复表单
      setProps({disabled:true})
    });
    //获取标题
    const getTitle = computed(() => {
      // update-begin--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
      if (!unref(isUpdate)) {
        return '回复审核';
      } else {
        return '工单办结';
      }
      // update-end--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
    });
    const { adaptiveWidth } = useDrawerAdaptiveWidth();
  
    //提交事件
    async function handleSubmit() {
      try {
        let values = await validate();
        setModalProps({ confirmLoading: true });
        values.userIdentity === 1 && (values.departIds = '');
        let isUpdateVal = unref(isUpdate);
        let params = values;
        const ticketId = currentEditRecordRef.value?.id;
        const newParams = {
          "auditList": [
            // {
            //   "assignId": 0,
            //   "auditStatus": 0,
            //   "rejectReason": ""
            // }
          ],
          "fileRead": params.fileRead,
          "finalResolveResult": params.finalResolveResult,
          "followCode": params.followCode,
          "needVisit": params.needVisit,
          "overseeUserName": params.overseeUserName,
          "overseeUserPhone": '',
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
  