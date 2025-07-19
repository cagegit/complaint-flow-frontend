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
      :ok-button-props="{ vAuth: 'biz:complain:visitAudit:save' }"
    >
      <div class="flex px-3">
        <div style="flex: 1">
            <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="回访审核" force-render>
              <div class="pl-20">
                 <a-divider orientation="left">审核内容</a-divider>
                  <BasicForm @register="registerAuditForm"/>
                 <a-divider orientation="left">预回复</a-divider>
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
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, auditFormSchema } from './follow-audit.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { saveReviewReply, getReplyDetail } from './follow-audit.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
      // @ts-ignore
    import UploadList from '../components/UploadList/index.vue';
    // @ts-ignore
    import { preFormLogicHandler, formFinalSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    //@ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getCitySevenFiveList, getComplaintDetail } from '/@/api/common/api';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { getPreReplyDetail } from '../components/PreReplyForm/preReplyForm.api';
    // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { audioTypes, imageTypes } from '/@/utils/fileType';
    const { createMessage, createConfirmSync } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    // let isFormDepartUser = false;
    const replyList = ref<any[]>([]);
    const total = ref(0);
    // 全部回复文件列表
    const allReplyFileList = ref<any[]>([]);
    // 当前key
    const activeKey = ref('1');
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 表单详情
    const ticketDetail = ref<any>({});
    // 预回文件列表
    let preReplyFileList:any[] = [];
    // 预回复删除的文件ID列表
    let preReplyDeleteFileIdList:any[] = [];
    // 预回复表单
    const [registerPreReplyForm, { validate: validatePreReplyForm, clearValidate: clearPreReplyValidate, setFieldsValue: setPreReplyFieldsValue, updateSchema }] = useForm({
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
    //基础信息表单配置
    const [registerForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
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
    //回访审核表单配置
    const [registerAuditForm, { validate:validateAuditForm, setFieldsValue: setAuditFieldsValue }] = useForm({
      labelWidth: 150,
      schemas: auditFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
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
      activeKey.value = '1'; // 默认选中第一个tab
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      try {
        const res = await getReplyDetail({ ticketId: data.record.id });
        console.log(res);
        if(res) {
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
          total.value = res.replyList?.length || 0;
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
        // 设置审核表单值
        setAuditFieldsValue({
          followCode: detailRes.followCode ? detailRes.followCode +'' : '',
          labelCode: detailRes.labelCode ? detailRes.labelCode +'' : '',
          rejectReason: detailRes.rejectReason ? detailRes.rejectReason : '',
          finalResolveResult: detailRes.finalResolveResult ? detailRes.finalResolveResult : '',
          remark: detailRes.remark ? detailRes.remark : '',
        });
        // 七有五性回显
        if(detailRes?.sevenFiveId) {
          getCitySevenFiveList().then(sevenFiveData => {
            if(Array.isArray(sevenFiveData)) {
              sevenFiveData.forEach((item:any) => {
                if(item.id == detailRes.sevenFiveId) {
                  // detailRes.sevenFiveId = item.name;
                  setAuditFieldsValue({
                    sevenFiveId: item.allParentIds ? item.allParentIds.split(',') : [],
                  });
                }
              });
            }
          }).catch(error => {
            console.log(error);
          });
        }
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
            // 增加对ApiSelect组件的处理
            // communityId: preRes.upReply.communityId ? preRes.upReply.communityId.split(',') : [],
            // 处理附件
            attachments: Array.isArray(preRes.handleFileList) ? preRes.handleFileList : []
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, updateSchema);
          // 清除验证
          clearPreReplyValidate?.();
        }
      }).catch(err => {
        console.error('查询预回复详情失败', err);
      });
    });
    //获取标题
    const getTitle = computed(() => {
      return '回访审核';
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
        // 审核表单
        let auditValues = await validateAuditForm();
        // 预回复表单
        let preReplyValues = await validatePreReplyForm();
        // console.log('auditValues', auditValues);
        // console.log('preReplyValues', preReplyValues);
        // 先验证回访审核表单
        // let values = await validate();
        setModalProps({ confirmLoading: true });
        // 判断附件是否存在
        let newFileList:any[] = [];
        // 如果审核状态不是-1，则需要检查预回复的附件
        if(auditValues.auditStatus != -1) {
          let fileResult:any = false;
          // 如果附件不存在，提示确认框
          if(!preReplyValues?.attachments) {
            fileResult = await createConfirmSync({
                title: '提示',
                content: '附件列表为空，请确认是否继续？',
                okText: '继续',
                cancelText: '取消',
              });
          }
         
          if (!fileResult && !preReplyValues?.attachments) {
            createMessage.error('请上传附件');
            setModalProps({ confirmLoading: false });
            throw new Error('请上传附件!');
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
          
          // newFileList = preReplyFileList.map(v => {
          //   return {
          //     districtFileTagType: v.districtFileTagType,
          //     fileKey: v.fileKey,
          //     fileName: v.fileName,
          //     fileSize: v.fileSize,
          //     fileTagType: v.fileTagType,
          //     id: v.id
          //   }
          // });  
        }
        // console.log('newFileList', newFileList);
        let isUpdateVal = unref(isUpdate);
        // let params = values;
        const ticketId = currentEditRecordRef.value?.id;
        const newParams = {
          "auditStatus": auditValues.auditStatus,
          "deleteFileIdList": [],
          "finalResolveResult": auditValues.finalResolveResult,
          "followCode": auditValues.followCode,
          "labelCode": auditValues.labelCode,
          "needVisit":  auditValues.needVisit,
          "rejectReason": auditValues.rejectReason,
          "remark": auditValues.remark,
          "replyFileList": [
            // ...replyList.value,
            ...newFileList
          ],
          "sevenFiveId": auditValues.sevenFiveId,
          // "ticketId": 0,
          "ticketReplyDataVo": {
            ...preReplyValues,
            replyRequestName: preReplyValues.replyRequestType
          },
          "ticketId": ticketId
        };
        //提交表单
        await saveReviewReply(newParams);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{isUpdateVal, auditValues});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
  </script>
  