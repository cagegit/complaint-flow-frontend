<template>
  <div class="p-3">
    <div class="bg-white pt-6">
      <BasicForm @register="registerForm" />
    </div>
  </div>
</template>
  <script lang="ts" setup>
import { ref, useAttrs, onMounted } from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema } from './cycle.data';
import { usePermission } from '/@/hooks/web/usePermission';
import { getConfig, saveCycle } from './cycle.api';
import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
import { useMessage } from '/@/hooks/web/useMessage';

const { createMessage } = useMessage();
const { hasPermission } = usePermission();
// 声明Emits
const emit = defineEmits(['success', 'register']);
const attrs = useAttrs();
const isUpdate = ref(true);
const rowId = ref('');
const departOptions = ref([]);
let isFormDepartUser = false;
//表单配置
const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  submitButtonOptions: {
    loading: false,
    disabled: !hasPermission('biz:complain:time_cycle:save'),
    text: '保存',
    preIcon: 'ant-design:check-circle-outlined',
    onClick: handleSubmit,
  },
  // resetButtonOptions: {
  //   text: '取消',
  //   onClick: () => {
  //     resetFields();
  //   },
  // },
  showActionButtonGroup: true,
  showSubmitButton: true,
  showResetButton: false,
  // layout: 'vertical',
  // rowProps: { justify: 'end', align: 'middle' },
  //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
  baseColProps: { span: 12 },
  //row行的样式
  // baseRowStyle: { width: '100%' },
  actionColOptions: {
    span: 24,
    offset: 21,
  },
});

onMounted(() => {
  getConfigFun();
});

async function getConfigFun() {
  try {
    let values = await getConfig();
    let params = values;
    console.log('params', params);
    setFieldsValue({ cycleTime: params.cycleTime, cycleDayNumber: params.cycleDayNumber });
  } finally {
  }
}

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
    getConfigFun();
  } finally {
    resetFields();
  }
}
</script>
  