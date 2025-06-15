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
    >
      <div class="flex px-3">
        <div style="flex: 1; border-right: 1px solid #ddd;">
            <!-- <BasicForm @register="registerForm"/> -->
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="回访审核">               
               <!-- 回复审核内容回显，三行两列，第一行显示：录音已倾听、跟进情况，第二行：督办人，第三行：最终处理情况 -->
               <a-collapse v-model:activeKey="collapsibleKey" ghost>
                <a-collapse-panel key="1" header="回复记录">
                  <!-- 回复列表 -->
                  <div class="pr-4">
                    <ReplyRecord 
                      :replyData="replyList" 
                      :total="total" 
                      :readOnly="true"
                      @auditChange="handleAuditChange"
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
              <!-- 分割线 -->
             <a-divider orientation="left" ><span class="text-red-500">*回访审核(必填表单)</span></a-divider>
              <!-- 回复审核表单 -->
              <BasicForm @register="registerAuditForm"/>
               <a-divider orientation="left">预回复(可选)</a-divider>
              <BasicForm @register="registerPreReplyForm">
                  <template #satisfactionTimeSlot="{model, field}">
                    <a-space>
                      <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                      <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                    </a-space>
                  </template>
                  <template #contactTimeSlot="{model, field}">
                    <a-space>
                      <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                      <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                    </a-space>
                  </template>
                    <template #resolutionTimeSlot="{model, field}">
                    <a-space>
                      <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                      <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                    </a-space>
                  </template>
                  <!-- 附件 -->
                  <template #uploadAttachmentsSlot="{model, field}">
                    <UploadList v-model:value="model[field]" @change="changePreList" @delete="handleDeleteList"/>
                  </template>
              </BasicForm>
            </a-tab-pane>
            <a-tab-pane key="2" tab="基础信息" force-render>
              <!-- 拒绝信息 -->
               <RejectInfo :detailInfo="ticketDetail" />
              <!-- 基本信息区域 -->   
               <BasicForm @register="registerForm"/>
              <!-- 领导批示区域 -->
              <LeaderInstruction
                v-if="ticketDetail.id"
                :ticketId="ticketDetail.id"
                :zrContent="ticketDetail.zhurenSuggest"
                :sjContent="ticketDetail.shujiSuggest"
                :style="{width: '85%'}"
              />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, formAuditSchema } from './follow-up.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { saveReviewReply, getReplyDetail } from './follow-up.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
    //@ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    import { getDictItemsByCode } from '/@/utils/dict';
     // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    // @ts-ignore
    import { preFormLogicHandler, formFinalNoRequiredSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    import { getPreReplyDetail, savePreReply } from '../components/PreReplyForm/preReplyForm.api';
    import { audioTypes, imageTypes } from '/@/utils/fileType';
    const replyList = ref<any[]>([]);
    const finalReplyList = ref<any[]>([]);
    const total = ref(0);
    // @ts-ignore
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    // let isFormDepartUser = false;
    // tab当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 回复详情
    const replyDetailRef = ref<any>({
      fileRead: 0,
      followCode: '',
      overseeUserName: '',
      finalResolveResult: ''
    });
    // 折叠面板key
    const collapsibleKey = ref<string | null>('2');
    // 表单详情
    const ticketDetail = ref<any>({});
    // 预回文件列表
    let preReplyFileList:any[] = [];
    // 预回复删除的文件ID列表
    let preReplyDeleteFileIdList:any[] = [];
    // 从字典获取跟进情况
    const followCodeInfo = computed(() => {
      const array = getDictItemsByCode('biz_follow_code') || [];
      console.log('array', array);
      return array.find(item => item.value == replyDetailRef.value.followCode)?.text || '-'
    });
    // 预回复表单
    const [registerPreReplyForm, { validate: validatePreReplyForm, setFieldsValue: setPreReplyFieldsValue, updateSchema: preReplyUpdateSchema }] = useForm({
      labelWidth: 150,
      schemas: preReplyFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 12 },
      //row行的样式
      baseRowStyle: { width: '100%', }
    });
    //回复审核表单配置
    const [registerAuditForm, { setProps: setAuditProps, validate }] = useForm({
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
    const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema }] = useForm({
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
    // const [registerAddForm] = useForm({
    //   labelWidth: 150,
    //   schemas: addFormSchema,
    //   showActionButtonGroup: false,
    //   layout: 'vertical',
    //   rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    //   //row行的样式
    // });
    // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
    const showFooter = ref(true);
    //表单赋值
    const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
      await resetFields();
      console.log(data);
      // 恢复默认值
      preReplyFileList = []
      preReplyDeleteFileIdList = []
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      currentEditRecordRef.value = data.record;
      // 查询详情数据
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
        // 回复列表
        // replyList.value = res?.replyList || [];
        total.value = res?.replyList?.length || 0;
        finalReplyList.value = res?.replyList || [];
      } catch (error) {
        console.error('Error fetching reply detail:', error);
      }

      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        let detailRes:any = {};
        try {
          detailRes = await getComplaintDetail(data.record.id);
          ticketDetail.value = detailRes;
        } catch (error) {
          console.log(error);
        }
        setFieldsValue({
          ...data.record,
          ...detailRes
        });
      }
      // 隐藏底部时禁用整个表单
      // 根据审核状态，设置是否可以编辑，禁止暂时footer
      if (data?.record?.processStatus == 1) {
        setAuditProps({ disabled: true });
        showFooter.value = false;
      } else {
        setAuditProps({ disabled: false });
        showFooter.value = true;
      }
      // 查询预回复详情
      getPreReplyDetail({ticketId: data.record?.id}).then(preRes => {
        console.log(preRes);
        if(preRes?.upReply) {
          // 设置预回复表单值
          setPreReplyFieldsValue({
            ...preRes.upReply,
             replySatisfiedTime: preRes.upReply.replySatisfiedTime ? preRes.upReply.replySatisfiedTime.split(',') : [],
            replyContactTime: preRes.upReply.replyContactTime ? preRes.upReply.replyContactTime.split(',') : [],
            replyResolveTime: preRes.upReply.replyResolveTime ? preRes.upReply.replyResolveTime.split(',') : [],
            // 增加对级联字段的处理
            replyRequestType: preRes.upReply.replyRequestType ? preRes.upReply.replyRequestType.split(',') : [],
            lastOfficeId: preRes.upReply.lastOfficeId ? preRes.upReply.lastOfficeId.split(',') : [],
            whistleDepartmentId: preRes.upReply.whistleDepartmentId ? preRes.upReply.whistleDepartmentId.split(',') : [],
            removeHangingAccountsTypeId: preRes.upReply.removeHangingAccountsTypeId ? preRes.upReply.removeHangingAccountsTypeId.split(',') : [],
            // 处理附件
            attachments: Array.isArray(preRes.handleFileList) ? preRes.handleFileList : []
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, preReplyUpdateSchema);
        }
      }).catch(err => {
        console.error('查询预回复详情失败', err);
      });
    });
    //获取标题
    const getTitle = computed(() => {
      return '工单回访';
    });
    const { adaptiveWidth } = useDrawerAdaptiveWidth();

    function changePreList(list:any[]) {
      console.log(list);
      preReplyFileList = list;
    }
    // 删除预回复文件
    function handleDeleteList(file:any) {
      console.log('删除预回复文件', file);
      // preReplyFileList = preReplyFileList.filter(v => v.fileKey !== file.fileKey);
      if (preReplyDeleteFileIdList.indexOf(file.id) === -1) {
        preReplyDeleteFileIdList.push(file.id);
      }
    }
    //提交事件
    async function handleSubmit() {
      try {
        // 先校验回复审核表单
        let values = await validate();
        // 优先保存预回复表单
        try{
          if(currentEditRecordRef.value) {
            const preParams = await validatePreReplyForm();
            // 判断附件是否存在
            let newFileList:any[] = [];
            if (preParams?.attachments) {
              newFileList = preReplyFileList.map(v => {
                return {
                  districtFileTagType: v.districtFileTagType,
                  fileKey: v.fileKey,
                  fileName: v.fileName,
                  fileSize: v.fileSize,
                  fileTagType: v.fileTagType,
                  id: v.id
                }
               });  
            }
            const resResult = await savePreReply({
              "deleteFileIdList": preReplyDeleteFileIdList,
              "replyFileList": newFileList,
              "ticketId": currentEditRecordRef.value?.id,
              "ticketReplyDataVo": {
                ...preParams
              }
            });
            console.log('保存预回复信息成功', resResult);
          }
        } catch (error) {
          console.error('保存区级信息失败', error);
        }
        setModalProps({ confirmLoading: true });
        values.userIdentity === 1 && (values.departIds = '');
        let isUpdateVal = unref(isUpdate);
        let params = values;
        const ticketId = currentEditRecordRef.value?.id;
        const newParams = {
          "labelCode": params.labelCode,
          "remark": params.remark,
          "responseFlag": params.responseFlag,
          "sevenFiveId": params.sevenFiveId ? params.sevenFiveId.split(',').pop() : '',
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

    // 处理审核变更
    const handleAuditChange = async (res:any) => {
      // const currentReplyId = res.reply
     const reply = finalReplyList.value.find(item => item.id === res.id);
     if (reply) {
       reply.auditStatus = res.status;
       reply.rejectReason = res.reason;
     }
    };
  </script>
  