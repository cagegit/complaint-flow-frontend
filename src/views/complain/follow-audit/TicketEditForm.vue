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
        <div style="flex: 1; border-right: 1px solid #ddd;">
            <!-- <BasicForm @register="registerForm"/> -->
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="回复审核">
              <BasicForm @register="registerAuditForm"/>
            </a-tab-pane>
            <a-tab-pane key="2" tab="基础信息" force-render>
               <BasicForm @register="registerForm"/>
            </a-tab-pane>
          </a-tabs>
        </div>
        <div style="width: 300px; padding-left: 30px;">
            <!-- <a-divider type="vertical" style="height: 60px; background-color: #7cb305" ></a-divider> -->
            <!-- 待补充信息区域 -->
            <BasicForm
                :schemas="addFormSchema"
                @register="registerAddForm"
            />
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, addFormSchema, formAuditSchema } from './follow-audit.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { saveReviewReply, getReplyDetail } from './follow-audit.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  
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
    //回复审核表单配置
    const [registerAuditForm] = useForm({
      labelWidth: 150,
      schemas: formAuditSchema,
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
    //待补充表单配置
    const [registerAddForm] = useForm({
      labelWidth: 150,
      schemas: addFormSchema,
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
      const res = await getReplyDetail({ assignId: data.record.assignId });
      console.log(res);
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        setFieldsValue({
          ...data.record,
        });
      }
      // 隐藏底部时禁用整个表单
      //update-begin-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
      setProps({ disabled: !showFooter.value });
      //update-end-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
    });
    //获取标题
    const getTitle = computed(() => {
      // update-begin--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
      if (!unref(isUpdate)) {
        return '回复审核';
      } else {
        return '回复';
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
  