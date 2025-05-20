<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="adaptiveWidth"
    @ok="handleSubmit"
    :showFooter="showFooter"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, useAttrs } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './list.data';
  import { addKnowledge, editKnowledge } from './list.api';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const attrs = useAttrs();
  const isUpdate = ref(true);
  const rowId = ref('');
  const departOptions = ref([]);
  let isFormDepartUser = false;
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
  const showFooter = ref(true);
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    showFooter.value = data?.showFooter ?? true;
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // if (unref(isUpdate)) {
    //   rowId.value = data.record.id;
    //   //租户信息定义成数组
    //   if (data.record.relTenantIds && !Array.isArray(data.record.relTenantIds)) {
    //     data.record.relTenantIds = data.record.relTenantIds.split(',');
    //   } else {
    //     //【issues/I56C5I】用户管理中连续点两次编辑租户配置就丢失了
    //     //data.record.relTenantIds = [];
    //   }
    //   //负责部门/赋值
    //   data.record.departIds && !Array.isArray(data.record.departIds) && (data.record.departIds = data.record.departIds.split(','));
    //   //update-begin---author:zyf   Date:20211210  for：避免空值显示异常------------
    //   //update-begin---author:liusq   Date:20231008  for：[issues/772]避免空值显示异常------------
    //   data.record.departIds =  (!data.record.departIds || data.record.departIds == '') ? [] : data.record.departIds;
    //   //update-end-----author:liusq   Date:20231008  for：[issues/772]避免空值显示异常------------
    //   //update-begin---author:zyf   Date:20211210  for：避免空值显示异常------------
    // }

    //update-end---author:wangshuai ---date:20230522  for：【issues/4935】租户用户编辑界面中租户下拉框未过滤，显示当前系统所有的租户------------
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
      return '新增知识库';
    } else {
      return unref(showFooter) ? '编辑知识库' : '知识库详情';
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
      // -update-begin--author:liaozhiyang---date:20240702---for：【TV360X-1737】部门用户编辑接口，增加参数updateFromPage:"deptUsers"
      let params = values;
      if (isFormDepartUser) {
        params = { ...params, updateFromPage: 'deptUsers' };
      }
      // -update-end--author:liaozhiyang---date:20240702---for：【TV360X-1737】部门用户编辑接口，增加参数updateFromPage:"deptUsers"
      if (!isUpdateVal) {
        await addKnowledge(params);
      } else {
        await editKnowledge(params);
      }
      //提交表单
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success',{isUpdateVal ,values});
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
