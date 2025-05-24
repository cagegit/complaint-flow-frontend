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
  import { ref, computed, unref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './list.data';
  import { getDetail, saveKnowledge } from '/@/api/complaint/knowledge';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { watch, nextTick } from 'vue';

  const props = defineProps({
    deptList: {
      type: Array,
      default: () => [],
    },
    optionTextList: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '1',
    },
  });

  // 表单数据
  const formSchemaData = ref([...formSchema]);

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  let isFormDepartUser = false;

  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: formSchemaData.value,
    showActionButtonGroup: false,
  } as any);

  // 标记当前是否正在更新表单，避免循环更新
  let isUpdating = false;

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    let res: any = null;
    if (data?.isUpdate) {
      try {
        res = await getDetail({ id: data.record.id });
      } catch (error) {
        console.error('获取详情失败:', error);
      }
    }
    showFooter.value = data?.showFooter ?? true;
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      const newValue = {
        ...data.record,
      };
      if (data.isUpdate) {
        newValue.content = res.knowledgeLibrary.content;
        newValue.fileKeyList = JSON.stringify(res.fileList.map((item: any) => ({ ...item, filePath: item.fileKey })));
      }
      setFieldsValue(newValue);
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !showFooter.value });
  });
  //获取标题
  const getTitle = computed(() => {
    if (!unref(isUpdate)) {
      return '新增知识库';
    } else {
      return unref(showFooter) ? '编辑知识库' : '知识库详情';
    }
  });
  const { adaptiveWidth } = useDrawerAdaptiveWidth();

  // 更新表单选项
  const updateFormOptions = () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      // 更新部门列表选项
      if (formSchemaData.value[1]?.componentProps) {
        (formSchemaData.value[1].componentProps as any).options = props.deptList;
      }

      // 更新诉求事项选项
      if (formSchemaData.value[2]?.componentProps) {
        (formSchemaData.value[2].componentProps as any).options = props.optionTextList;
      }

      // 延迟更新表单配置，避免Vue渲染循环中更新引起的问题
      nextTick(() => {
        if (updateSchema) updateSchema(formSchemaData.value as any);
        isUpdating = false;
      });
    } catch (error) {
      console.error('表单更新错误:', error);
      isUpdating = false;
    }
  };

  // 监听props变化，使用深比较避免不必要的更新
  watch(
    () => [props.deptList, props.optionTextList],
    () => {
      updateFormOptions();
    },
    { immediate: true, deep: true }
  );

  onMounted(() => {});

  const showFooter = ref(true);

  //提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      values.userIdentity === 1 && (values.departIds = '');
      let isUpdateVal = unref(isUpdate);
      let params = values;
      if (isFormDepartUser) {
        params = { ...params, updateFromPage: 'deptUsers' };
      }
      params.type = props.type;
      if (params.fileKeyList) {
        const list = JSON.parse(params.fileKeyList);
        const newFileKeyList = list.map((item: any) => item.filePath);
        params.fileKeyList = newFileKeyList;
      }
      console.log('params', params);
      await saveKnowledge(params);
      //提交表单
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', { isUpdateVal, values });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
