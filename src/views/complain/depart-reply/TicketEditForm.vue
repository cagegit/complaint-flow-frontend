<template>
    <BasicModal
      v-bind="$attrs"
      @register="registerDrawer"
      :title="getTitle"
      :width="1024"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
      @cancel="closeTheModal"
    >
    <div style="max-height: 800px; overflow: auto;">
      <div class="flex px-3 relative ">
         <!-- 折叠展开icon -->
        <div style="position: absolute; top: 300px; right: 500px;  width: 24px; z-index: 10; background:#fff;" :style="{...showLeft? {right:'500px'}:{left:'14px'}}">
            <LeftCircleOutlined style="font-size: 24px;" title="收起" v-if="showLeft"  @click="handleCollapse(false)"/>
            <RightCircleOutlined style="font-size: 24px;" title="展开" v-if="!showLeft" @click="handleCollapse(true)"/>
         </div>
        <div v-if="!showLeft" style="border-right: 1px solid #ddd; padding-right: 15px;"></div> 
        <div style="flex: 1; border-right: 1px solid #ddd; padding-right: 15px; " :style="{display: showLeft ? 'block': 'none'}">
          <div >
            <RejectInfo :detailInfo="ticketDetail" />
            <BasicForm @register="registerForm"/>
            <LeaderInstruction
              v-if="ticketDetail.id"
              :ticketId="ticketDetail.id"
              :zrContent="ticketDetail.zhurenSuggest"
              :sjContent="ticketDetail.shujiSuggest"
              :style="{width: '85%'}"
            />
          </div>
        </div>

        <div style="width: 500px; padding-left: 40px; " :style="{width: showLeft ? '500px': 'auto'}">
            <a-divider><span class="text-red-500">必填表单区域</span></a-divider>
            <BasicForm
                :schemas="addFormSchema"
                @register="registerAddForm"
            >
            <template #audioDurationSlot="record">
              <a-space>
                <a-time-picker
                  v-model="record.model.audioDuration[0]"
                  format="HH:mm:ss"
                  style="width: 100%"
                />
                <a-input v-model="record.model.audioDuration[1]" placeholder="00分00秒处表明态度" />
              </a-space>
              </template>
            </BasicForm>
            <a-divider>可选表单区域</a-divider>
               <a-collapse v-model:activeKey="subActiveKey" ghost>
                <a-collapse-panel key="1" header="预回复表单">
                  <BasicForm
                    @register="registerPreReplyForm"
                  >
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
                  </BasicForm>
                </a-collapse-panel>
              </a-collapse>
        </div>
      </div>
      </div>
      <!-- 插值footer -->
      <template #footer>
        <div class="align-right">
          <a-space>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" @click="handleSubmit('2')">提交回复</a-button>
            <a-button type="default" @click="handleSubmit('1')">保存回复</a-button>
          </a-space>
        </div>
      </template>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, addFormSchema } from './depart.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { addDepartReply, getReplyDetail, saveSubmitReply } from './depart.api';
    import { useMessage } from '/@/hooks/web/useMessage';
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    import { getComplaintDetail } from '/@/api/common/api';
    // @ts-ignore
    import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
    // 预回复表单
    import { preFormLogicHandler, formSchema as preReplyFormSchema } from '../components/PreReplyForm/preReplyForm.data';
    import { getPreReplyDetail, savePreReply } from '../components/PreReplyForm/preReplyForm.api';
    // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    import { audioTypes, imageTypes } from '/@/utils/fileType';

    // const { showQuReplyConfirm } = useConfirm();

    const { createMessage } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register', 'qjForm']);
    // 折叠面板
    const showLeft = ref<boolean>(true);
    // 折叠面板的activeKey
    const subActiveKey = ref<string>('');
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    // 预回复详情
    const preReplyDetail = ref<any>(null);
    //表单配置
    const [registerForm, {setFieldsValue: setBasicFieldsValue}] = useForm({
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
    const [registerAddForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: addFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 12, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
    //预回复表单配置
    const [registerPreReplyForm, { setFieldsValue: setPreReplyFieldValues, validate: preReplyValidate, updateSchema: preReplyUpdateSchema }] = useForm({
      labelWidth: 150,
      schemas: preReplyFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
    // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
    const showFooter = ref(true);
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
    // 表单被关闭
    let isQjFormCloseDirect = false;
    // 表单详情
    const ticketDetail = ref<any>({});
    //表单赋值
    const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
      await resetFields();
      console.log(data);
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      // 赋值
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      let res:any = null;
      try {
        res = await getReplyDetail({ assignId: data.record.assignId });
        console.log(res);
        if(res) {
          let audioList:any = [];
          let fileList:any = [];
          let imageList:any = [];
          // 附件列表
          if (Array.isArray(res.fileList)) {
            // 分类，图片、音频、其他
            res.fileList.forEach((item:any) => {
              // 根据文件后缀名判断类型
              let fileType = item.fileName.split('.').pop();
              if (audioTypes.includes(fileType)) {
                audioList.push({
                  uid: item.id,
                  name: item.fileName,
                  status: 'done',
                  url: item.fileKey,
                  response: item, // 保留原始数据
                });
              } else if (imageTypes.includes(fileType)) {
                imageList.push({
                  uid: item.id,
                  name: item.fileName,
                  status: 'done',
                  url: item.fileKey,
                  response: item, // 保留原始数据
                });
              } else {
                fileList.push({
                  uid: item.id,
                  name: item.fileName,
                  status: 'done',
                  url: item.fileKey,
                  response: item, // 保留原始数据
                });
              }

            });
            audioList.length && setFieldsValue({ audio: audioList });
            imageList.length && setFieldsValue({ image: imageList });
            fileList.length && setFieldsValue({ file: fileList });
          }
          // 表单内容
          if(res.upReply) {
            setFieldsValue({
              ...res,
              attachments: fileList,
            });
          }
        }
      } catch (error) {
        console.error('获取详情失败', error);
      }
     
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
         // 从详情接口查询
        let detailRes:any = {};
        try {
          detailRes = await getComplaintDetail(data.record.id);
          ticketDetail.value = detailRes;
        } catch (error) {
          console.log(error);
        }
        setBasicFieldsValue({
          ...data.record,
          ...detailRes
        });
      }
      if(res) {
        setFieldsValue({
         department: res.orgName,
         resolveResult: res.resolveResult || null,
         remark: res.remark || null,
         overseeUserName: res.overseeUserName || null,
        });
      }
      // 查询预回复详情
      getPreReplyDetail({ticketId: data.record?.id}).then(preRes => {
        console.log(preRes);
        if(preRes?.upReply) {
          preReplyDetail.value = preRes.upReply;
          // 设置预回复表单值
          setPreReplyFieldValues({
            ...preRes.upReply,
             replySatisfiedTime: preRes.upReply.replySatisfiedTime ? preRes.upReply.replySatisfiedTime.split(',') : [],
            replyContactTime: preRes.upReply.replyContactTime ? preRes.upReply.replyContactTime.split(',') : [],
            replyResolveTime: preRes.upReply.replyResolveTime ? preRes.upReply.replyResolveTime.split(',') : [],
            // 增加对级联字段的处理
            replyRequestType: preRes.upReply.replyRequestType ? preRes.upReply.replyRequestType.split(',') : [],
            lastOfficeId: preRes.upReply.lastOfficeId ? preRes.upReply.lastOfficeId.split(',') : [],
            whistleDepartmentId: preRes.upReply.whistleDepartmentId ? preRes.upReply.whistleDepartmentId.split(',') : [],
            removeHangingAccountsTypeId: preRes.upReply.removeHangingAccountsTypeId ? preRes.upReply.removeHangingAccountsTypeId.split(',') : [],
          });
          const upReply = preRes.upReply;
          // 更新组件级联关系
          preFormLogicHandler(upReply, preReplyUpdateSchema);
        } else {
          preReplyDetail.value = null;
        }
      }).catch(err => {
        console.error('查询预回复详情失败', err);
      });
    });
    //获取标题
    const getTitle = computed(() => {
      // update-begin--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
      if (!unref(isUpdate)) {
        return '回复';
      } else {
        return '部门回复';
      }
      // update-end--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
    });
    // const { adaptiveWidth } = useDrawerAdaptiveWidth();
    // 折叠左侧面板
    function handleCollapse(val:boolean) {
      showLeft.value = val;
    }
    //提交事件
    async function handleSubmit(tp:string ='1') {
      try {
        let values = await validate();
        setModalProps({ confirmLoading: true });
        values.userIdentity === 1 && (values.departIds = '');
        let isUpdateVal = unref(isUpdate);
        // -update-begin--author:liaozhiyang---date:20240702---for：【TV360X-1737】部门用户编辑接口，增加参数updateFromPage:"deptUsers"
        let params = values;
        console.log('params', params);
        const assignId = currentEditRecordRef.value?.assignId || '';
        const addFileList:any[] = [];
        let idx = 0;
        // 文件/视频
        if(Array.isArray(params.file)){
          params.file.forEach((item) => {
            addFileList.push({
              assignId: assignId,
              fileKey: item.fileKey,
              fileName: item.name,
              id: ++idx,
              remark: '',
              type: '1' // file
            });
          });
        } else if(typeof params.file === 'string' && params.file) {
          params.file.split(',').forEach((item) => {
            item = item.trim();
            if(!item) return;
            addFileList.push({
                assignId: assignId,
                fileKey: item,
                fileName: item,
                id: ++idx,
                remark: '',
                type: '1' // file
              });
          });
        }
        // 图片
        if(Array.isArray(params.image)){
          params.image.forEach((item) => {
            addFileList.push({
              assignId: assignId,
              fileKey: item.fileKey,
               fileName: item.name,
              id: ++idx,
              remark: '',
              type: '2' // 2 image
            });
          });
        } else if(typeof params.image === 'string' && params.image) {
            params.image.split(',').forEach((item) => {
              item = item.trim();
              if(!item) return;
              addFileList.push({
                  assignId: assignId,
                  fileKey: item,
                  fileName: item,
                  id: ++idx,
                  remark: '',
                  type: '2' // 2 image
                });
            });
        }
        // 音频
        if(Array.isArray(params.audio)){
          params.audio.forEach((item) => {
            addFileList.push({
              assignId: assignId,
              fileKey: item.fileKey,
              fileName: item.name,
              id: ++idx,
              remark: '',
              type: '3' // 3 audio
            });
          });
        } else if(typeof params.audio === 'string' && params.audio) {
          params.audio.split(',').forEach((item) => {
            item = item.trim();
            if(!item) return;
            // 处理音频
            addFileList.push({
              assignId: assignId,
              fileKey: item,
              fileName: item,
              id: ++idx,
              remark: '',
              type: '3' // 3 audio
            });
          });
        }
      // 判断文件列表是否为空
      if(addFileList.length === 0) {
        createMessage.error('上传附件不能为空，必选上传其中任意一种！');
        return;
      }
      // 优先保存区级信息
      try{
        if(currentEditRecordRef.value) {
          const preParams = await preReplyValidate();
          const resResult = await savePreReply({
            "deleteFileIdList": [],
            "replyFileList": [],
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
      
       const newParams = {
          "addFileList": addFileList,
          "assignId": assignId,
          "deleteFileIdList": [],
          "overseeUserName": params.overseeUserName,
          "overseeUserPhone": "",
          "remark": params.remark,
          "replyAudioDuration": 0,
          "replyAudioNote": "",
          "resolveResult": params.resolveResult,
        };
        try {
          if(tp === '2') { // 执行社区审核操作
            await saveSubmitReply(newParams);
          } else {
            await addDepartReply(newParams);
          }
        } catch (error) {
          console.error('提交失败', error);
        }
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{isUpdateVal ,values});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }

    function closeTheModal() {
      isQjFormCloseDirect= false;
    }
  </script>
  