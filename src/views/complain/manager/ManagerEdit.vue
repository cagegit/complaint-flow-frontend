<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerDrawer"
    :title="getTitle"
    :width="1000"
    @ok="handleSubmit"
    :showFooter="showFooter"
    destroyOnClose
    :maskClosable="false"
    :ok-button-props="{ vAuth: 'complain:manager:edit' }"
  >
    <div class="pl-8">
      <a-collapse v-model:activeKey="collapsibleKey" ghost>
                <a-collapse-panel key="1" header="回复记录">
                  <!-- 回复列表 -->
                  <div class="pr-4">
                    <ReplyRecord 
                      :replyData="replyList" 
                      :total="total" 
                      :readOnly="true"
                    />
                  </div>
                </a-collapse-panel>
                <a-collapse-panel key="2" header="回复审核结果">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="flex">
                        <p class="font-bold">录音已倾听：</p>
                        <p class="text-gray-600">{{ replyDetailRef?.fileRead === 1? '是' : '否' }}</p>
                      </div>
                      <div class="flex">
                        <p class="font-bold">跟进情况：</p>
                        <p class="text-gray-600">{{ followCodeInfo }}</p>
                      </div>
                      <div class="flex">
                        <p class="font-bold">督办人：</p>
                        <p class="text-gray-600">{{ replyDetailRef?.overseeUserName || '-' }}</p>
                      </div>
                      <div class="flex">
                        <p class="font-bold">最终处理情况：</p>
                        <p class="text-gray-600">{{ replyDetailRef?.finalResolveResult || '-' }}</p>
                      </div>
                  </div>
                </a-collapse-panel>
               </a-collapse>
      <a-divider orientation="left" >基础信息</a-divider>
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
//@ts-ignore
import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
import { getDictItemsByCode } from '/@/utils/dict';
import { getReplyDetail } from '../follow-up/follow-up.api';
import { audioTypes, imageTypes } from '/@/utils/fileType';
// 声明Emits
const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
const showFooter = ref(true);
const collapsibleKey = ref<string | null>('2');

const replyList = ref<any[]>([]);
// const finalReplyList = ref<any[]>([]);
const total = ref(0);
// 回复详情
const replyDetailRef = ref<any>({
  fileRead: 0,
  followCode: '',
  overseeUserName: '',
  finalResolveResult: ''
});
// 从字典获取跟进情况
const followCodeInfo = computed(() => {
  const array = getDictItemsByCode('biz_follow_code') || [];
  console.log('array', array);
  return array.find(item => item.value == replyDetailRef.value.followCode)?.text || '-'
});
//表单配置
const [registerForm, { setFieldsValue: setBasicFieldsValue, validate, resetFields, setProps }] = useForm({
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
  try {
    const res = await getReplyDetail({ ticketId: data.record.id });
    console.log(res);
    replyDetailRef.value = res;
    // 处理文件数据
    let newFileList = res?.replyList?.map((v:any) => {
        v.fileCount = 0;
        v.imageCount = 0;
        v.audioCount = 0;
        v.fileList?.forEach(item => {
          // console.log('item', item);
          // item.fileCount = (item.fileCount || 0) + 1;
          let fileType = item.fileName.split('.').pop();
          if (audioTypes.includes(fileType)) {
            v.audioCount++;
          } else if (imageTypes.includes(fileType)) {
            v.imageCount++;
          } else {
            v.fileCount++;
          }
      });
      return {
        ...v
      };
    }) || [];
    replyList.value = newFileList;
    total.value = res?.replyList?.length || 0;
  } catch (error) {
    console.error('Error fetching manage info:', error);
  }
  if (typeof data.record === 'object') {
    // 无论新增还是编辑，都可以设置表单值
    setBasicFieldsValue({
      ...data.record,
      sourceType: data.record.sourceType,
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
    let values = await validate();
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