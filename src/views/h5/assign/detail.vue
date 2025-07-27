<template>
  <div class="p-0">
    <div style="width: 100%; overflow: auto; padding: 20px 15px">
      <!-- 拒绝信息 -->
      <RejectInfo :detailInfo="ticketDetail" />
      <!-- 基本信息区域 -->
      <BasicForm @register="registerForm" />
      <!-- 领导批示区域 -->
      <LeaderInstruction
        v-if="ticketResult.id"
        :ticketId="ticketResult.id"
        :zrContent="ticketResult.zhurenSuggest"
        :sjContent="ticketResult.shujiSuggest"
        :style="{ width: '85%' }"
      />
    </div>
    <!-- 底部按钮 停靠在底部 -->
    <div class="flex justify-between mt-4 gap-2 fixed bottom-0 left-0 right-0 bg-white p-4">
      <a-button block @click="closeModal">关闭</a-button>
      <a-button type="primary" block :loading="confirmLoading" @click="handleSubmit">提交</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema, addFormSchema } from '/@/views/complain/assign/assign.data';
  // import { BasicModal, useModalInner } from '/@/components/Modal';
  import {  getAssignDetail } from '/@/views/complain/assign/assign.api';
  import { addTicket, editTicket } from '/@/views/complain/bizComplaintTicketList/ticket.api';
  import { getComplaintDetail } from '/@/api/common/api';
  // @ts-ignore
  import RejectInfo from '/@/views/complain/components/RejectInfo/index.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  // @ts-ignore 领导批示组件
  import LeaderInstruction from '/@/views/complain/components/LeaderInstruction/index.vue';
  import { useRoute } from 'vue-router';
  // 声明wx小程序web-view 对象
  declare const wx: any;

  const route = useRoute();

  const { createMessage } = useMessage();

  const isUpdate = ref(true);
  // 当前表单内容
  let currentData: any = {};
  // 表单详情
  const ticketDetail = ref<any>({});
  // 接口返回详情
  const ticketResult = ref<any>({});
  const confirmLoading = ref(false);

  //表单配置
  const [registerForm, { setFieldsValue: setBasicFieldsValue, validate, updateSchema, resetFields, setProps }] = useForm({
    labelWidth: 100,
    schemas: formSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 24 },
    //row行的样式
    baseRowStyle: { width: '100%' },
    // 禁用表单
    disabled: true,
  });
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

  onMounted(async () => {
    console.log('route.query', route.query);
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
    //表单赋值
    showFooter.value = data?.showFooter ?? true;
    isUpdate.value = !!data?.isUpdate;
    // 给当前data赋值
    currentData = data;
    console.log('data', data);
    let assignDetail: any = {};
    // 查询分派详情
    try {
      assignDetail = await getAssignDetail(data.record.id);
      // console.log(res);
    } catch (error) {
      console.log(error);
    }
    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      // 从详情接口查询
      let res: any = {};
      try {
        res = await getComplaintDetail(data.record.id);
        console.log(res);
        ticketDetail.value = res;
        ticketResult.value = res;
        // 处理社区/居委会
        let communityList: any[] = [];
        if (Array.isArray(assignDetail?.assignCommunityList)) {
          assignDetail.assignCommunityList.forEach((v: any) => {
            if (v.orgId) {
              communityList.push([v.parentOrgId, v.orgId]);
            }
          });
        }
        console.log(communityList);
      } catch (error) {
        console.log(error);
      }
      setBasicFieldsValue({
        ...data.record,
        ...res,
      });
    }
  });

  //提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      confirmLoading.value = true;
      values.userIdentity === 1 && (values.departIds = '');
      let params = values;

      if (isUpdate.value) {
        // 编辑
        //提交表单
        await editTicket({ ...params, id: route.query.id });
      } else {
        // 新增
        // params.id = rowId.value;
        await addTicket(params);
      }
      createMessage.info('提交成功');
      setTimeout(() => {
        closeModal();
      }, 2000);
      //关闭弹窗
    } finally {
      confirmLoading.value = false;
    }
  }
</script>
