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
              <!-- 回复审核表单 -->
              <BasicForm @register="registerAuditForm"/>
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
    const total = ref(0);
    // @ts-ignore
    import ReplyRecord from '../components/ReplyRecord/index.vue'; // 导入回复记录组件
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
     // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { audioTypes, imageTypes } from '/@/utils/fileType';
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
    //回复审核表单配置
    const [registerAuditForm, {setProps: setAuditFormProps, validate}] = useForm({
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
        } catch (error) {
          console.log(error);
        }
        setFieldsValue({
          ...data.record,
          ...detailRes
        });
      }
      // 隐藏底部时禁用整个表单
      //update-begin-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
      // setProps({ disabled: !showFooter.value });
      //update-end-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
    });
    //获取标题
    const getTitle = computed(() => {
      return '回复审核';
    });
    // const { adaptiveWidth } = useDrawerAdaptiveWidth();
  
    //提交事件
    async function handleSubmit() {
      try {
        let values = await validate();
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
