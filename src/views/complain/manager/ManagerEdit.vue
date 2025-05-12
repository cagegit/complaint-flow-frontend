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
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './manager.data';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { editTicket } from './manager.api';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  const showFooter = ref(true);

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 12, style: { marginBottom: '10px' } },
    //row行的样式
    baseRowStyle: { width: '100%' },
  });

  //表单赋值
  const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    showFooter.value = data?.showFooter ?? true;
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      setFieldsValue({
        ...data.record,
      });
    }
    // 隐藏底部时禁用整个表单
    setModalProps({ disabled: !showFooter.value });
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
      let values = await validate();
      setModalProps({ confirmLoading: true });
      let isUpdateVal = unref(isUpdate);
      let params = values;
      //提交表单
      await editTicket(params);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', { isUpdateVal, values });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script> 