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
      :ok-button-props="{vAuth:['biz:complain:upAudit:finalReply','biz:complain:upAudit:reject']}"
    >
      <div class="flex px-3">
        <div style="flex: 1">
            <!-- <BasicForm @register="registerForm"/> -->
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="预回复">
              <div class="pl-20">
                <!-- 二选一 -->
                <div class="py-4 flex border-b border-gray-200 mb-4">
                  <div class="text-dark-100">请选择最终回复或驳回终审：</div>
                  <a-radio-group v-model:value="finalChoice" name="choiceGroup">
                    <a-radio v-auth="'biz:complain:upAudit:finalReply'" value="1">最终回复</a-radio>
                    <a-radio v-auth="'biz:complain:upAudit:reject'" value="0"><span class="text-red-500">驳回终审</span></a-radio>
                  </a-radio-group>
                </div>
                <!-- <a-divider class="mb-4"></a-divider> -->
                <div v-show="finalChoice == '0'">
                   <BasicForm @register="registerRejectForm"></BasicForm>
                </div>
                <div v-show="finalChoice === '1'">
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
                      <UploadList v-model:value="model[field]" :replyFileList="allReplyFileList" @change="changePreList" @delete="handleDeleteList" />
                      </template>
                  </BasicForm>
                </div>
              </div>
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
                  :style="{width: '89%'}"
               />
            </a-tab-pane>
            <a-tab-pane key="3" tab="回复记录" force-render>
              <div class="pr-4">
                  <ReplyRecord 
                    :replyData="replyList" 
                    :total="total" 
                    :readOnly="true"
                  />
                </div>
             </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema } from './need-completion.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { saveReviewReply, getReplyDetail, confirmReply } from './need-completion.api';
    // import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
    // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    // @ts-ignore
    import { formFinalSchema as preReplyFormSchema, preFormLogicHandler } from '../components/PreReplyForm/preReplyForm.data';
     //@ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { getPreReplyDetail } from '../components/PreReplyForm/preReplyForm.api';
    // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { defaultSpan } from '../shareInfo';
    const { createMessage, createConfirmSync } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
    // 最终回复选择
    const finalChoice = ref<string>('1'); // 默认选择最终回复
    // 当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 回复列表
    const replyList = ref<any[]>([]);
    const total = ref(0);
    // 全部回复文件列表
    const allReplyFileList = ref<any[]>([]);
    // 表单详情
    const ticketDetail = ref<any>({});
    // 预回文件列表
    let preReplyFileList:any[] = [];
    // 预回复删除文件ID列表
    let preReplyDeleteFileIdList:any[] = [];
    // 拒绝表单
    const rejectFormSchema:any[] = [
      // 驳回原因
      {
        field: 'rejectReason',
        label: '驳回原因',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          placeholder: '请输入驳回原因',
          rows: 6,
        },
        colProps: { span: 24 }
      }
    ]
    //最终驳回表单配置
    const [registerRejectForm, {  validate: rejectValidate }] = useForm({
      labelWidth: 150,
      schemas: [...rejectFormSchema],
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 8 },
      //row行的样式
      baseRowStyle: { width: '100%', }
    });

    //回复审核表单配置
    const [registerPreReplyForm, { setFieldsValue: setPreReplyFieldsValue,  validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: [...preReplyFormSchema],
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 8 },
      //row行的样式
      baseRowStyle: { width: '100%', }
    });
    //基础信息表单配置
    const [registerForm, { setProps, resetFields, setFieldsValue }] = useForm({
      labelWidth: 150,
      schemas: formSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: defaultSpan },
      //row行的样式
      baseRowStyle: { width: '100%', },
      disabled: true
    });
    // //待补充表单配置
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
      // 恢复默认设置
      preReplyFileList = []
      preReplyDeleteFileIdList = [];
      allReplyFileList.value = [];
      activeKey.value = '1'; // 默认选中预回复
      finalChoice.value = '1'; // 默认选择最终回复
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      try {
        const res = await getReplyDetail({ ticketId: data.record.id });
        console.log(res);
       if (res) {
          replyList.value = res.replyList || [];
          total.value = res.total || 0;
          // 处理回复文件列表
          let replyFileList:any[] =[];
          res?.replyList?.forEach((item:any) => {
              item.fileList?.forEach((file:any) => {
                replyFileList.push({
                  id: null, // 新增的文件ID为null
                  fileName: file.fileName || '',
                  fileSize: file.fileSize || 0,
                  fileKey: file.fileKey || '',
                  districtFileTagType: null,
                  fileTagType: null,
                });
              });
            });
            console.log('replyFileList', replyFileList);
            allReplyFileList.value = replyFileList;
        }
      } catch (error) {
        console.error('Error fetching reply list:', error);
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
            attachments: Array.isArray(preRes.handleFileList) ? preRes.handleFileList : [],
             // 增加对级联字段的处理
            replyRequestType: preRes.upReply.replyRequestType ? preRes.upReply.replyRequestType.split(',') : [],
            lastOfficeId: preRes.upReply.lastOfficeId ? preRes.upReply.lastOfficeId.split(',') : [],
            whistleDepartmentId: preRes.upReply.whistleDepartmentId ? preRes.upReply.whistleDepartmentId.split(',') : [],
            removeHangingAccountsTypeId: preRes.upReply.removeHangingAccountsTypeId ? preRes.upReply.removeHangingAccountsTypeId.split(',') : [],
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, updateSchema);
        }
      }).catch(err => {
        console.error('查询预回复详情失败', err);
      });
    });
    //获取标题
    const getTitle = computed(() => {
      return '最终审核';
    });
    // const { adaptiveWidth } = useDrawerAdaptiveWidth();
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
        setModalProps({ confirmLoading: true });
        // let isUpdateVal = unref(isUpdate);
        const ticketId = currentEditRecordRef.value?.id;
        // 如果审核状态拒绝
        if (finalChoice.value === '0') {
          // params.rejectReason = values.rejectReason;
          const rejectValues = await rejectValidate();
          //提交驳回表单
          await confirmReply({
            "ticketId": ticketId,
            "rejectReason": rejectValues.rejectReason
          });
        } else {
          const values = await validate();
          let params = values;
          const { _responseFlag, _rejectReason, ...rest } = params;
          // 判断附件是否存在
          // let newFileList:any[] = preReplyFileList.map(v => {
          //     return {
          //       districtFileTagType: v.districtFileTagType,
          //       fileKey: v.fileKey,
          //       fileName: v.fileName,
          //       fileSize: v.fileSize,
          //       fileTagType: v.fileTagType,
          //       id: v.id
          //     }
          //    }); ;
          let newFileList:any[] = [];
          let fileResult:any = false;
          if(!params?.attachments) {
            fileResult = await createConfirmSync({
              title: '提示',
              content: '附件列表为空，请确认是否继续？',
              okText: '继续',
              cancelText: '取消',
            });
          }
          if (!fileResult && !params?.attachments) {
            createMessage.error('请上传附件');
            setModalProps({ confirmLoading: false });
            throw new Error('请上传附件');
          } else {
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
          // 最终回复
          const newParams = {
            "replyFileList": [...newFileList],
            "ticketReplyDataVo": {
              ...rest,
              replyRequestName: rest.replyRequestType
            },
            "ticketId": ticketId,
            "deleteFileIdList": preReplyDeleteFileIdList,
          };
          //提交表单
          await saveReviewReply(newParams);
        }
        
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
  </script>
  