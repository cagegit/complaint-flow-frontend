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
      :okButtonProps="{
       'v-auth': 'biz:complain:reply:audit',
      }"
    >
      <div class="flex px-3">
        <div style="flex: 1">
            <!-- <BasicForm @register="registerForm"/> -->
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="回复审核">
              <!-- 回复列表 -->
               <div class="pr-4">
                <ReplyRecord 
                  :replyData="replyList" 
                  :total="total" 
                  :readOnly="false"
                  @auditChange="handleAuditChange"
                />
               </div>
                <!-- 分割线 -->
              <a-divider orientation="left" ><span class="text-red-500">*回复审核(必填表单)</span></a-divider>
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
                    <UploadList v-model:value="model[field]" :replyFileList="allReplyFileList" @change="changePreList" @delete="handleDeleteList"/>
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
    import { formSchema, formAuditSchema } from './review.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { saveReviewReply, getReplyDetail } from './review.api';
    // import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
    const replyList = ref<any[]>([]);
    const finalReplyList = ref<any[]>([]);
    // 全部回复文件列表
    const allReplyFileList = ref<any[]>([]);
    const total = ref(0);
    // @ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { audioTypes, imageTypes } from '/@/utils/fileType';
    // @ts-ignore
    import { preFormLogicHandler, formFinalNoRequiredSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    import { getPreReplyDetail, savePreReply } from '../components/PreReplyForm/preReplyForm.api';
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
    // 当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 是否包含拒绝
    const isReject = ref(false);
    // 表单详情
    const ticketDetail = ref<any>({});
    // 预回文件列表
    let preReplyFileList:any[] = [];
    // 预回复删除文件id列表
    let preReplyDeleteFileIdList:string[] = [];
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
    const [registerAuditForm, {setProps: setAuditFormProps, setFieldsValue: setAuditFieldsValue, validate}] = useForm({
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
    const [registerForm, { resetFields, setFieldsValue }] = useForm({
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
      preReplyDeleteFileIdList = [];
      allReplyFileList.value = [];
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      let res:any =null;
      try {
        res = await getReplyDetail({ ticketId: data.record.id });
        console.log(res);
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
        finalReplyList.value = res?.replyList || []; 
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
      } catch (error) {
        console.error('获取详情失败', error);
      }
      console.log(res);
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        let detailRes:any = {};
        try {
          detailRes = await getComplaintDetail(data.record.id);
          ticketDetail.value = detailRes;
          const keys = Object.keys(detailRes);
          // 回显审核表单
          if(keys.includes('fileRead') && keys.includes('followCode')) {
            setAuditFieldsValue({
              fileRead: detailRes.fileRead ? detailRes.fileRead +'' : null,
              followCode: detailRes.followCode ? detailRes.followCode +'' : null,
              overseeUserName: detailRes.overseeUserName ? detailRes.overseeUserName : null,
              finalResolveResult: detailRes.finalResolveResult ? detailRes.finalResolveResult : null,
            });
          }
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
      return '回复审核';
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
        console.log(params);
        console.log(finalReplyList.value);
        const newParams = {
          "auditList": finalReplyList.value.map(item => ({
            assignId: item.id,
            auditStatus: item.auditStatus,
            rejectReason: item.rejectReason
          })),
          // [
            // {
            //   "assignId": 0,
            //   "auditStatus": 0,
            //   "rejectReason": ""
            // }
          // ],
          "fileRead": params.fileRead || '',
          "finalResolveResult": params.finalResolveResult || '',
          "followCode": params.followCode,
          "needVisit": params.needVisit,
          "overseeUserName": params.overseeUserName,
          "overseeUserPhone": '',
          "ticketId": ticketId
        };
        console.log(newParams);
        try {
          //提交表单
          await saveReviewReply(newParams);
          //刷新列表
          emit('success',{isUpdateVal ,values});
        } catch (error) {
          console.error('获取详情失败', error);
        }
        //关闭弹窗
        closeModal();
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }

    // 处理审核变更
    const handleAuditChange = async (res:any) => {
      // const currentReplyId = res.reply
     const reply = finalReplyList.value.find(item => item.id === res.id);
     console.log(reply);
     console.log(finalReplyList);
     if (reply) {
       reply.auditStatus = res.status;
       reply.rejectReason = res.reason;
       if (res.status === -1) {
         setAuditFormProps({disabled: true});
       } else {
         // auditStatus 只要有一个为-1时，禁用表单
          const hadRejected = finalReplyList.value.some(item => item.auditStatus === -1);
          setAuditFormProps({disabled: hadRejected});
       }
     }
    };
</script>
