<template>
    <BasicModal
      v-bind="$attrs"
      @register="registerDrawer"
      :title="getTitle"
      :width="1000"
      @ok="handleSubmit"
      @cancel="closeTheModal"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
    >
      <div class="flex px-3">
        <div style="flex: 1; border-right: 1px solid #ddd; max-height: 700px; overflow: auto;">
          <!-- 拒绝信息 -->
          <RejectInfo :detailInfo="ticketDetail" />
          <!-- 基本信息区域 -->    
          <BasicForm @register="registerForm"/>
        </div>
        <div style="width: 400px; padding-left: 30px;">
            <!-- <a-divider type="vertical" style="height: 60px; background-color: #7cb305" ></a-divider> -->
            <!-- 待补充信息区域 -->
            <BasicForm
                :schemas="addFormSchema"
                @register="registerAddForm"
                >
            <template #audioDurationSlot="record">
              <!-- <a>{{ JSON.stringify(record) }}</a> -->
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
        </div>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, unref, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema, addFormSchema } from './community.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { addCommunityReploy, getReplyDetail } from './community.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
    import { useMessage } from '/@/hooks/web/useMessage';
    import {useConfirm} from '../hooks/useConfirm';
    import { getComplaintDetail } from '/@/api/common/api';
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';
    const { showQuReplyConfirm } = useConfirm();

    const { createMessage } = useMessage();
    // 声明Emits
    const emit = defineEmits(['success', 'register', 'qjForm']);
    // 声明Props
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
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
      // 禁用表单
      disabled: true
    });
    //待补充表单配置
    const [registerAddForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: addFormSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //row行的样式
    });
    // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
    const showFooter = ref(true);
    // 区级表单直接被关闭
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
      currentEditRecordRef.value = data.record;
      // 查询详情数据
      let res:any = null;
      try {
        res = await getReplyDetail({ assignId: data.record.assignId });
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
              if (['mp3', 'wav','m4a'].includes(fileType)) {
                audioList.push({
                  uid: item.id,
                  name: item.fileName,
                  status: 'done',
                  url: item.fileKey,
                  response: item, // 保留原始数据
                });
              } else if (['jpg', 'jpeg', 'png'].includes(fileType)) {
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
        console.log(error);
      }
      console.log(res);
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
    });
    //获取标题
    const getTitle = computed(() => {
      // update-begin--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
      if (!unref(isUpdate)) {
        return '回复';
      } else {
        return '社区回复';
      }
      // update-end--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
    });
    const { adaptiveWidth } = useDrawerAdaptiveWidth();
  
    //提交事件
    async function handleSubmit() {
      try {
        let values = await validate();
        setModalProps({ confirmLoading: true });
        values.userIdentity === 1 && (values.departIds = '');
        let isUpdateVal = unref(isUpdate);
        let params = values;
        console.log('params community:', params);
        const assignId = currentEditRecordRef.value?.assignId || '';
        const addFileList:any[] = [];
        let idx = 0;
        // 文件/视频
        if(Array.isArray(params.file)){
          params.file.forEach((item) => {
            addFileList.push({
              assignId: assignId,
              fileKey: item.fileKey,
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
              id: ++idx,
              remark: '',
              type: '3' // 3 audio
            });
          });
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
        // 判断文件列表是否为空
        if(addFileList.length === 0) {
          createMessage.error('上传附件不能为空，必选上传其中任意一种！');
          return;
        }
        // 弹出区级回复确认对话框
        if(!isQjFormCloseDirect) {
          const res = await showQuReplyConfirm((resolve:any) => {
            emit('qjForm', {
              record: currentEditRecordRef.value,
              resolve
            });
          });
          if(res === 'close') {
            isQjFormCloseDirect = true;
            return;
          }
        }
        //提交表单
        await addCommunityReploy(newParams);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{isUpdateVal ,values});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
    //关闭弹窗
    function closeTheModal() {
      isQjFormCloseDirect = false;
    }
  </script>
  