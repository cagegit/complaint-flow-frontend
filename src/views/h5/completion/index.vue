<template>
  <div class="p-0">
    <div style="width: 100%; overflow: auto; padding: 20px 15px">
      <div style="flex: 1">
        <!-- <BasicForm @register="registerForm"/> -->
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="基础信息" force-render>
            <!-- 拒绝信息 -->
            <RejectInfo :detailInfo="ticketDetail" />
            <!-- 基本信息区域 -->
            <BasicForm @register="registerForm" />
            <!-- 领导批示区域 -->
            <LeaderInstruction
              v-if="ticketDetail.id"
              :ticketId="ticketDetail.id"
              :zrContent="ticketDetail.zhurenSuggest"
              :sjContent="ticketDetail.shujiSuggest"
              :readOnly="true"
              :style="{ width: '85%' }"
            />
          </a-tab-pane>
          <a-tab-pane key="2" tab="预回复" force-render>
            <BasicForm @register="registerPreReplyForm">
              <template #satisfactionTimeSlot="{ model, field }">
                <a-space>
                  <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                  <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                </a-space>
              </template>
              <template #contactTimeSlot="{ model, field }">
                <a-space>
                  <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                  <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                </a-space>
              </template>
              <template #resolutionTimeSlot="{ model, field }">
                <a-space>
                  <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                  <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                </a-space>
              </template>
              <!-- 附件 -->
              <template #uploadAttachmentsSlot="{ model, field }">
                <UploadList v-model:value="model[field]" :read-only="true" />
              </template>
            </BasicForm>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <!-- 底部按钮 停靠在底部 -->
    <!-- <div class="flex justify-between mt-4 gap-2 fixed bottom-0 left-0 right-0 bg-white p-4">
      <a-button block @click="closeModal">关闭</a-button>
      <a-button type="primary" block :loading="confirmLoading" @click="handleSubmit">提交</a-button>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '/@/views/complain/completion/completion.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';

  import { saveReviewReply, getReplyDetail } from '/@/views/complain/completion/completion.api';
  // @ts-ignore
  import UploadList from '/@/views/complain/components/UploadList/index.vue';
  // @ts-ignore
  import { preFormLogicHandler, formFinalNoRequiredSchema as preReplyFormSchema } from '/@/views/complain/components/PreReplyForm/preReplyForm.data';
  // @ts-ignore
  import RejectInfo from '/@/views/complain/components/RejectInfo/index.vue';
  import { getComplaintDetail } from '/@/api/common/api';
  import { getPreReplyDetail } from '/@/views/complain/components/PreReplyForm/preReplyForm.api';
  // @ts-ignore 领导批示组件
  import LeaderInstruction from '/@/views/complain/components/LeaderInstruction/index.vue';
  // 声明wx小程序web-view 对象
  declare const wx: any;

  const route = useRoute();
  // 当前key
  const activeKey = ref('1');
  // 当前编辑工单
  const currentEditRecordRef = ref<any>(null);
  // 表单详情
  const ticketDetail = ref<any>({});
  //预回复表单
  const [registerPreReplyForm, { setProps, setFieldsValue: setPreReplyFieldValues, updateSchema: preReplyUpdateSchema }] = useForm({
    labelWidth: 150,
    schemas: preReplyFormSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 12 },
    //row行的样式
    baseRowStyle: { width: '100%' },
  });
  //基础信息表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 12 },
    //row行的样式
    baseRowStyle: { width: '100%' },
    disabled: true,
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
  const confirmLoading = ref(false);

  const { createMessage } = useMessage();

  function setModalProps(props: any) {
    // 设置modal属性
    confirmLoading.value = props?.confirmLoading || false;
  }

  function closeModal(data: any = null) {
    // 关闭当前页面,发送数据给打开页面并返回
    if (wx?.miniProgram) {
      wx?.miniProgram?.postMessage?.({
        data: JSON.stringify({
          action: 'postData',
          data: data,
        }),
      });
      wx?.miniProgram?.navigateBack?.();
    } else {
      // 如果是h5页面，直接关闭
      window?.history?.back?.();
    }
  }
  //表单赋值
  onMounted(async () => {
    // 从url获取record信息
    let data: any = {
      isUpdate: true,
      record: {},
    };
    try {
      if (route.query) {
        data.record = {
          ...route.query,
        };
      }
    } catch (error) {
      console.error('Error parsing record from query:', error);
    }
    await resetFields();
    console.log(data);
    showFooter.value = data?.showFooter ?? true;
    setModalProps({ confirmLoading: false });
    currentEditRecordRef.value = data.record;
    // 查询详情数据
    const res = await getReplyDetail({ ticketId: data.record.id });
    console.log(res);
    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      let detailRes: any = {};
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
        ...detailRes,
      });
    }
    // 查询预回复详情
    getPreReplyDetail({ ticketId: data.record?.id })
      .then((preRes) => {
        console.log(preRes);
        if (preRes?.upReply) {
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
            attachments: Array.isArray(preRes.handleFileList) ? preRes.handleFileList : [],
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, preReplyUpdateSchema);
        }
      })
      .catch((err) => {
        console.error('查询预回复详情失败', err);
      });
    // 禁用预回复表单
    setProps({ disabled: true });
  });

  //提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      values.userIdentity === 1 && (values.departIds = '');
      let params = values;
      const ticketId = currentEditRecordRef.value?.id;
      const newParams = {
        auditList: [
          // {
          //   "assignId": 0,
          //   "auditStatus": 0,
          //   "rejectReason": ""
          // }
        ],
        fileRead: params.fileRead,
        finalResolveResult: params.finalResolveResult,
        followCode: params.followCode,
        needVisit: params.needVisit,
        overseeUserName: params.overseeUserName,
        overseeUserPhone: '',
        ticketId: ticketId,
      };
      //提交表单
      await saveReviewReply(newParams);
      createMessage.info('提交成功');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
