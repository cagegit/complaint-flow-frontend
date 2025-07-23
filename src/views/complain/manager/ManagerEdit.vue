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
      <a-tabs v-model:activeKey="activeKey" @change="activeKeyChange">
        <a-tab-pane key="1" tab="基础信息">
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
            <div class="p-1">
               <BasicForm @register="registerForm" />
            </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="分派信息" forceRender>
          <div class="p-1 min-h-[400px]">
            <BasicForm @register="registerAssignForm" />
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="工单记录" forceRender>
          <div class="record-list">
            <BasicTable @register="registerRecordTable" />
          </div>
        </a-tab-pane>
      </a-tabs>
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
import { BasicTable } from '/@/components/Table';
import { formSchema, ticketRecordListColumns } from './manager.data';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { editAssignComplain, editComplain, ticketRecordList } from './manager.api';
import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
//@ts-ignore
import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
import { getDictItemsByCode } from '/@/utils/dict';
import { getReplyDetail } from '../follow-up/follow-up.api';
import { audioTypes, imageTypes } from '/@/utils/fileType';
import { useListPage } from '/@/hooks/system/useListPage';
import { addFormSchema as EditAssignForm } from '../assign/assign.data';
import { getCitySevenFiveList, getCommunityChildList } from '/@/api/common/api';
// 声明Emits
const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
const showFooter = ref(true);
const collapsibleKey = ref<string | null>('2');
// 当前key
const activeKey = ref('1');
// 当前ticketId
const currentTicketId = ref<any>('');
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

//表单配置
const [registerAssignForm, { setFieldsValue: setAssignFieldsValue, validate: assignFormValidate, updateSchema: updateAssignSchema }] = useForm({
  labelWidth: 100,
  schemas: EditAssignForm.filter((item) => {
    return ['labelCode', 'reportDistrictId','reportCommunityId','sevenFiveId','caseNature']
    .includes(item.field); // 过滤掉不需要的字段
  }),
  showActionButtonGroup: false,
  // layout: 'vertical',
  rowProps: { gutter: 24, justify: 'start', align: 'middle' },
  //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
  baseColProps: { span: 12 },
  //row行的样式
  baseRowStyle: { width: '100%' },
});

//表单赋值
const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
  await resetFields();
  showFooter.value = data?.showFooter ?? true;
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  // 重置
  activeKey.value = '1';
  collapsibleKey.value = '2';
  replyList.value = [];
  total.value = 0;
  // 设置当前ID
  currentTicketId.value = data.record?.id;
  // // 查询分派详情
  try {
    const res = await getReplyDetail({ ticketId: data.record?.id });
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
    // 设置分派表单
    const record = data.record;
    // 反映社区回显
    if(record?.reportDistrictId) {
        getCommunityChildList(record.reportDistrictId).then(ksData => {
          // console.log(ksData)
          if (Array.isArray(ksData)) {
            updateAssignSchema({
              field: 'reportCommunityId',
              // required: true,
              componentProps: {
                options: ksData.map(v => {
                  return {
                    label: v.departName,
                    value: v.id
                  }
                }),
              }
            });
          }
        }).catch(error => {
          console.log(error);
        });
      }
      // 七有五性回显
      if(record?.sevenFiveId) {
        getCitySevenFiveList().then(sevenFiveData => {
          if(Array.isArray(sevenFiveData)) {
            sevenFiveData.forEach((item:any) => {
              if(item.id == record.sevenFiveId || item.allParentIds == record.sevenFiveId) {
                // res.sevenFiveId = item.name;
                setAssignFieldsValue({
                  sevenFiveId: item.allParentIds ? item.allParentIds.split(',') : [],
                });
              }
            });
          }
        }).catch(error => {
          console.log(error);
        });
      }
      // 其他参数
      setAssignFieldsValue({
        labelCode: record.labelCode != undefined ? `${record.labelCode}` : null,
        reportDistrictId: record.reportDistrictId,
        reportCommunityId: record.reportCommunityId,
        caseNature: record.caseNature != undefined  ? `${record.caseNature}` : null,
        remark: record.remark,
      });
   }
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !showFooter.value });
  // 刷新工单记录
  reload?.();
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

  const { tableContext } = useListPage({
    designScope: 'ticket-record-list-table',
    tableProps: {
      // title: '工单历史记录列表',
      api: ticketRecordList,
      columns: ticketRecordListColumns,
      // size: 'small',
      immediate: false,
      useSearchForm: false,
      showIndexColumn: false,
      showActionColumn: false,
      showTableSetting: false,
      beforeFetch: (params) => {
        // 这里可以添加额外的参数
        return Object.assign(params, {
          pageNum:  params.pageNo,
          sort: params.order === 'desc' ? 1 :  0,
          orderColumn: params.column,
          ticketId: currentTicketId.value,
        });
      },
    }
  });

  const [registerRecordTable , {reload}] = tableContext;

  // 基础信息编辑保存
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      // 分派表单
      if(activeKey.value === '2') {
        // 分派信息
         let values = await assignFormValidate();
          // let params = values;
          // params.ticketId = currentTicketId.value;
          // 提交表单
          await editAssignComplain({
            id: currentTicketId.value,
            ...values
          });

      } else {
        // 修改基础信息
        let values = await validate();
        // let isUpdateVal = unref(isUpdate);
        let params = values;
        //提交表单
        await editComplain(params);
      }
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', {});
    } catch(error) {
      console.error('表单验证失败:', error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function activeKeyChange(key: string) {
    // activeKey.value = key;
    console.log('activeKeyChange', key);
    // 切换到工单记录时隐藏底部按钮
    if (key == '3') {
       showFooter.value = false; // 隐藏底部按钮
    } else {
       showFooter.value = true; // 显示底部按钮
    }
  }
</script> 
<style lang="less">
.tooltip-wrapper {
  max-width: 800px;
  // max-height: 450px;
  // overflow-y: auto;
}
.tooltip-inner {
  padding: 10px;
}
</style>