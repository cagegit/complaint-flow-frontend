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
    import { formSchema, addFormSchema } from './depart.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    
    import { addDepartReply, getReplyDetail } from './depart.api';
    import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const departOptions = ref([]);
    let isFormDepartUser = false;
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
    const [registerAddForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
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
    // 当前编辑工单
    const currentEditRecordRef = ref<any>(null);
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
      const res = await getReplyDetail({ assignId: data.record.assignId });
      console.log(res);
     
      // 无论新增还是编辑，都可以设置表单值
      if (typeof data.record === 'object') {
        setBasicFieldsValue({
          ...data.record,
        });
      }
      if(res) {
        setFieldsValue({
         department: res.orgName,
        });
      }
      //update-end-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
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
    const { adaptiveWidth } = useDrawerAdaptiveWidth();
  
    //提交事件
    async function handleSubmit() {
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
        //提交表单
        await addDepartReply(newParams);
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success',{isUpdateVal ,values});
      } finally {
        setModalProps({ confirmLoading: false });
      }
    }
  </script>
  