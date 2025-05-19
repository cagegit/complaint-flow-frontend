<template>
  <div class="cycle-box">
    <BasicForm @register="registerForm" />
  </div>
</template>
  <script lang="ts" setup>
import { ref, computed, unref, useAttrs } from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema } from './cycle.data';

import { editPriority, saveCycle } from './cycle.api';
import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();

// 声明Emits
const emit = defineEmits(['success', 'register']);
const attrs = useAttrs();
const isUpdate = ref(true);
const rowId = ref('');
const departOptions = ref([]);
let isFormDepartUser = false;
//表单配置
const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 150,
  schemas: formSchema,
  submitButtonOptions: {
    loading: false,
    disabled: false,
    text: '保存',
    preIcon: 'ant-design:check-circle-outlined',
    onClick: handleSubmit,
  },
  resetButtonOptions: {
    text: '取消',
    onClick: () => {
      resetFields();
    },
  },
  showActionButtonGroup: true,
  showSubmitButton: true,
  showResetButton: true,
  // layout: 'vertical',
  rowProps: { gutter: 24, justify: 'end', align: 'middle' },
  //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
  baseColProps: { span: 12 },
  //row行的样式
  baseRowStyle: { width: '100%' },
});
// TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
// const showFooter = ref(true);
const { adaptiveWidth } = useDrawerAdaptiveWidth();

//提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    let params = values;
    params.cycleTime = params.cycleTime ? params.cycleTime.format('HH:mm:ss') : '';
    await saveCycle(params);
    createMessage.success(`保存成功！`);
  } finally {
    resetFields();
  }
}
</script>

<style lang="less" scoped>
.cycle-box {
  background: #fff;
  padding: 10px;
  margin: 10px;
}
</style>
  