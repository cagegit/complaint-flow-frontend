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
    <div class="pl-8">
      <BasicForm @register="registerForm" />
    </div>
    <!-- <div class="flex px-3">
      <div style="flex: 1; border-right: 1px solid #ddd">
        <BasicForm @register="registerForm" />
      </div>
      <div style="width: 300px; padding-left: 10px">
        <BasicForm :schemas="addFormSchema" @register="registerAddForm" />
      </div>
    </div> -->
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema, addFormSchema } from './manager.data';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { editComplain, getManageInfo } from './manager.api';
import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';

// 声明Emits
const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
const showFooter = ref(true);

//表单配置
const [registerForm, { setFieldsValue: setBasicFieldsValue, validate: BasicValidate, resetFields, setProps }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  showActionButtonGroup: false,
  // layout: 'vertical',
  rowProps: { gutter: 24, justify: 'start', align: 'middle' },
  //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
  baseColProps: { span: 12 },
  //row行的样式
  baseRowStyle: { width: '100%' },
});
// const [registerForm, { setFieldsValue: setBasicFieldsValue }] = useForm({
//   labelWidth: 150,
//   schemas: formSchema,
//   showActionButtonGroup: false,
//   layout: 'vertical',
//   rowProps: { gutter: 24, justify: 'center', align: 'middle' },
//   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
//   baseColProps: { span: 12 },
//   //row行的样式
//   baseRowStyle: { width: '100%' },
//   // 禁用表单
//   disabled: true,
// });
//待补充表单配置
// const [registerAddForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
//   labelWidth: 110,
//   schemas: addFormSchema,
//   showActionButtonGroup: false,
//   // layout: 'vertical',
//   rowProps: { gutter: 24, justify: 'start', align: 'middle' },
//   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
//   //row行的样式
//   baseColProps: { span: 24 },
// });

//表单赋值
const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
  await resetFields();
  showFooter.value = data?.showFooter ?? true;
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  // // 查询分派详情
  // const res = await getManageInfo(data.record.id);
  // console.log(res);
  // if (res && res.result) {
  //   setBasicFieldsValue({
  //     ...res.result,
  //     sourceType: '' + res.result.sourceType,
  //   });
  // }
  if (typeof data.record === 'object') {
    // 无论新增还是编辑，都可以设置表单值
    setBasicFieldsValue({
      ...data.record,
      sourceType: '' + data.record.sourceType,
    });
    // setFieldsValue({
    //   ...data.record,
    // });
  }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !showFooter.value });
});

//获取标题
const getTitle = computed(() => {
  if (!unref(isUpdate)) {
    return '新增工单';
  } else {
    return '编辑工单';
  }
});

const { adaptiveWidth } = useDrawerAdaptiveWidth();

//提交事件
async function handleSubmit() {
  try {
    let values = await BasicValidate();
    setModalProps({ confirmLoading: true });
    let isUpdateVal = unref(isUpdate);
    let params = values;
    //提交表单
    await editComplain(params);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', { isUpdateVal, values });
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script> 