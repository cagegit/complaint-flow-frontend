<template>
  <!-- <BasicModal
      v-bind="$attrs"
      @register="registerDrawer"
      :title="getTitle"
      :width="1024"
      :showFooter="showFooter"
      destroyOnClose
      :maskClosable="false"
      @cancel="closeTheModal"
      :confirmLoading="isSaving"
    > -->
  <div class="p-0">
    <div class="flex px-3 relative flex-col pb-[50px]">
      <div v-if="!showLeft" style="border-bottom: 1px solid #ddd; padding-bottom: 15px"></div>
      <!-- 折叠展开icon -->
      <div class="flex justify-center">
        <UpCircleOutlined style="font-size: 24px" title="收起" v-if="showLeft" @click="handleCollapse(false)" />
        <DownCircleOutlined style="font-size: 24px" title="展开" v-if="!showLeft" @click="handleCollapse(true)" />
      </div>
      <div :style="{ display: showLeft ? 'block' : 'none', width: '100%' }">
        <div>
          <RejectInfo :detailInfo="ticketDetail" />
          <BasicForm @register="registerForm" />
          <LeaderInstruction
            v-if="ticketDetail.id"
            :ticketId="ticketDetail.id"
            :zrContent="ticketDetail.zhurenSuggest"
            :sjContent="ticketDetail.shujiSuggest"
            :style="{ width: '85%' }"
          />
        </div>
      </div>

      <div style="width: 100%">
        <a-divider><span class="text-red-500">必填表单区域</span></a-divider>
        <BasicForm @register="registerAddForm">
          <template #audioDurationSlot="record">
            <a-space>
              <a-time-picker v-model="record.model.audioDuration[0]" format="HH:mm:ss" style="width: 100%" />
              <a-input v-model="record.model.audioDuration[1]" placeholder="00分00秒处表明态度" />
            </a-space>
          </template>
        </BasicForm>
        <a-divider>可选表单区域</a-divider>
        <a-collapse v-model:activeKey="subActiveKey" ghost>
          <a-collapse-panel key="1" header="预回复表单" forceRender>
            <BasicForm @register="registerPreReplyForm">
              <template #satisfactionTimeSlot="{ model, field }">
                <a-space>
                  <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                  <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                </a-space>
              </template>
              <template #contactTimeSlot="{ model, field }">
                <a-space>
                  <a-input-number v-model:value="model[field][0]" placeholder="请输入数字" />分
                  <a-input-number v-model:value="model[field][1]" placeholder="请输入数字" />秒
                </a-space>
              </template>
              <template #resolutionTimeSlot="{ model, field }">
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
    <!-- 插值footer -->
    <!-- <template #footer>
        <div class="align-right">
          <a-space>
            <a-button @click="closeModal">取消</a-button>
            <a-button v-auth="'biz:complain:reply:submit'" type="primary" @click="handleSubmit('2')">提交回复</a-button>
            <a-button v-auth="'biz:complain:reply:save'" type="default" @click="handleSubmit('1')">保存回复</a-button>
          </a-space>
        </div>
      </template> -->
    <!-- </BasicModal> -->
    <!-- 底部按钮 停靠在底部 -->
    <div class="flex justify-end mt-4 gap-2 fixed bottom-0 left-0 right-0 bg-white p-4 z-1">
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button :loading="confirmLoading" v-auth="'biz:complain:reply:submit'" type="primary" @click="handleSubmit('2')">提交回复</a-button>
        <a-button :loading="confirmLoading" v-auth="'biz:complain:reply:save'" type="default" @click="handleSubmit('1')">保存回复</a-button>
      </a-space>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, useAttrs, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '/@/views/complain/depart-reply/depart.data';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { addDepartReply, getReplyDetail, saveSubmitReply } from '/@/views/complain/depart-reply/depart.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  // @ts-ignore
  import RejectInfo from '/@/views/complain/components/RejectInfo/index.vue';
  import { getComplaintDetail } from '/@/api/common/api';
  // @ts-ignore
  import { UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons-vue';
  // 预回复表单
  import { preFormLogicHandler, formSchema as preReplyFormSchema } from '/@/views/complain/components/PreReplyForm/preReplyForm.data';
  import { getPreReplyDetail, savePreReply } from '/@/views/complain/components/PreReplyForm/preReplyForm.api';
  // @ts-ignore 领导批示组件
  import LeaderInstruction from '/@/views/complain/components/LeaderInstruction/index.vue';
  import { audioTypes, imageTypes, videoTypes } from '/@/utils/fileType';
  import { uploadJsFile } from '/@/api/common/api';
  import { UploadFileItem } from '/@/components/UploadItem/src/props';
  import { useRoute } from 'vue-router';
  // 声明wx小程序web-view 对象
  declare const wx: any;

  const route = useRoute();
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
  // const rowId = ref('');
  // const departOptions = ref([]);
  const isSaving = ref(false);
  const confirmLoading = ref(false);

  function setModalProps(props: any) {
    // 设置modal属性
    confirmLoading.value = props?.confirmLoading || false;
  }

  function closeModal(data: any = null) {
    // 关闭当前页面,发送数据给打开页面并返回
    if (wx?.miniProgram) {
      wx?.miniProgram?.postMessage?.({
        data: JSON.stringify({
          action: 'postData',
          data: data,
        }),
      });
      wx?.miniProgram?.navigateBack?.();
    } else {
      // 如果是h5页面，直接关闭
      window?.history?.back?.();
    }
  }
  // 详情接口返回fileList
  let respFileList: any[] = [];
  // 预回复详情
  const preReplyDetail = ref<any>(null);
  // 全局deleteFileIdList
  let deleteFileIdList: (string | number)[] = [];
  // 全局上上传文件列表
  let uploadFileList: UploadFileItem[] = [];
  let uploadImageList: UploadFileItem[] = [];
  let uploadAudioList: UploadFileItem[] = [];
  //表单配置
  const [registerForm, { setFieldsValue: setBasicFieldsValue }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 12 },
    //row行的样式
    baseRowStyle: { width: '100%' },
    disabled: true,
  });
  //待补充表单配置
  const [registerAddForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 150,
    schemas: [
      {
        field: 'department',
        label: '处理部门',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入处理部门',
          disabled: true,
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'overseeUserName',
        label: '督办人',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入督办人',
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'file',
        label: '附件/视频',
        component: 'UploadItem',
        componentProps() {
          return {
            // 具体上传配置
            multiple: true,
            accept: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', ...videoTypes],
            api: uploadJsFile, // 上传接口
            showDownloadButton: true,
            showPreviewButton: true,
            bizPath: 'complain/files', // 业务路径
            maxSize: 20, // 限制大小20M
            uploadParams: {
              biz: 'complain/file',
            },
            onPreviewDelete: (item: UploadFileItem) => {
              console.log('删除附件/视频', item);
              // 判断是否重复
              if (item.id && deleteFileIdList.indexOf(item.id) === -1) {
                deleteFileIdList.push(item.id);
              }
            },
            onChange: (fileList: UploadFileItem[]) => {
              console.log('附件/视频上传成功', fileList);
              // 更新全局上传文件列表
              uploadFileList = fileList;
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'image',
        label: '图片上传',
        component: 'UploadItem',
        componentProps() {
          return {
            multiple: true,
            accept: imageTypes, // 使用定义的图片类型
            api: uploadJsFile, // 上传接口
            bizPath: 'complain/images', // 业务路径
            maxSize: 20, // 限制大小20M
            uploadParams: {
              biz: 'complain/image',
            },
            onPreviewDelete: (item: UploadFileItem) => {
              console.log('删除图片', item);
              // 判断是否重复
              if (item.id && deleteFileIdList.indexOf(item.id) === -1) {
                deleteFileIdList.push(item.id);
              }
            },
            onChange: (fileList: UploadFileItem[]) => {
              console.log('图片上传成功', fileList);
              // 更新全局上传图片列表
              uploadImageList = fileList;
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'audio',
        label: '录音上传',
        component: 'UploadItem',
        componentProps() {
          return {
            multiple: true,
            accept: audioTypes,
            api: uploadJsFile, // 上传接口
            bizPath: 'complain/audio', // 业务路径
            maxSize: 20, // 限制大小20M
            uploadParams: {
              biz: 'complain/audio',
            },
            onPreviewDelete: (item: UploadFileItem) => {
              console.log('删除音频', item);
              // 判断是否重复
              if (item.id && deleteFileIdList.indexOf(item.id) === -1) {
                deleteFileIdList.push(item.id);
              }
            },
            onChange: (fileList: UploadFileItem[]) => {
              console.log('音频上传成功', fileList);
              // 更新全局上传音频列表
              uploadAudioList = fileList;
            },
          };
        },
        colProps: {
          span: 12,
        },
      },
      {
        field: 'replyFact',
        label: '是否属实',
        component: 'RadioGroup',
        // required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 12,
        },
        defaultValue: -1,
      },
      {
        field: 'replyResolve',
        label: '是否解决',
        component: 'RadioGroup',
        // required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 12,
        },
        defaultValue: -1,
      },
      {
        field: 'replySatisfy',
        label: '是否满意',
        component: 'RadioGroup',
        // required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 12,
        },
        defaultValue: -1,
      },
      {
        field: 'resolveResult',
        label: '处理情况',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          placeholder: '请输入处理情况',
          rows: 6,
        },
        colProps: { span: 24 },
        itemProps: {
          wrapperCol: { span: 24, sm: { span: 21 } },
        },
      },
      {
        field: 'remark',
        label: '备注',
        component: 'InputTextArea',
        componentProps: {
          placeholder: '请输入备注',
          rows: 3,
        },
        colProps: { span: 24 },
        itemProps: {
          wrapperCol: { span: 24, sm: { span: 21 } },
        },
      },
    ],
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
  // let isQjFormCloseDirect = false;
  // 表单详情
  const ticketDetail = ref<any>({});
  onMounted(async () => {
    // 从url获取record信息
    let data: any = {
      isUpdate: true,
      record: {},
    };
    try {
      if (route.query) {
        data.record = {
          ...route.query,
          assignId: route.query.id,
        };
      }
    } catch (error) {
      console.error('Error parsing record from query:', error);
    }
    // 重置
    subActiveKey.value = '';
    deleteFileIdList = [];
    uploadFileList = [];
    uploadImageList = [];
    uploadAudioList = [];
    showFooter.value = data?.showFooter ?? true;
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // 赋值
    currentEditRecordRef.value = data.record;
    // 查询详情数据
    let res: any = null;
    respFileList = [];
    try {
      res = await getReplyDetail({ assignId: data.record.assignId });
      console.log(res);
      if (res) {
        let audioList: any = [];
        let fileList: any = [];
        let imageList: any = [];
        // 赋值
        respFileList = res.fileList || [];
        // 附件列表
        if (Array.isArray(res.fileList)) {
          // 分类，图片、音频、其他
          res.fileList.forEach((item: any) => {
            // 根据文件后缀名判断类型
            let fileType = item.fileName.split('.').pop();
            if (audioTypes.includes(fileType)) {
              audioList.push({
                id: item.id,
                name: item.fileName,
                status: 'done',
                url: item.fileKey,
                response: item, // 保留原始数据
              });
              // audioList.push(item.fileKey)
            } else if (imageTypes.includes(fileType)) {
              imageList.push({
                id: item.id,
                name: item.fileName,
                status: 'done',
                url: item.fileKey,
                response: item, // 保留原始数据
              });
              // imageList.push(item.fileKey)
            } else {
              fileList.push({
                id: item.id,
                name: item.fileName,
                status: 'done',
                url: item.fileKey,
                response: item, // 保留原始数据
              });
              // fileList.push(item.fileKey);
            }
          });
          audioList.length && setFieldsValue({ audio: audioList });
          imageList.length && setFieldsValue({ image: imageList });
          fileList.length && setFieldsValue({ file: fileList });
        }
        // 表单内容
        if (res.upReply) {
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
      let detailRes: any = {};
      try {
        detailRes = await getComplaintDetail(data.record.id);
        ticketDetail.value = detailRes;
      } catch (error) {
        console.log(error);
      }
      setBasicFieldsValue({
        ...data.record,
        ...detailRes,
      });
    }
    if (res) {
      setFieldsValue({
        department: res.orgName,
        resolveResult: res.resolveResult || null,
        remark: res.remark || null,
        overseeUserName: res.overseeUserName || null,
        replyFact: res.replyFact !== undefined ? res.replyFact : null,
        replyResolve: res.replyResolve !== undefined ? res.replyResolve : null,
        replySatisfy: res.replySatisfy !== undefined ? res.replySatisfy : null,
      });
    }
    // 查询预回复详情
    getPreReplyDetail({ ticketId: data.record?.id })
      .then((preRes) => {
        console.log(preRes);
        if (preRes?.upReply) {
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
      })
      .catch((err) => {
        console.error('查询预回复详情失败', err);
      });
  });
  // 折叠左侧面板
  function handleCollapse(val: boolean) {
    showLeft.value = val;
  }
  //提交事件
  async function handleSubmit(tp: string = '1') {
    setModalProps({ confirmLoading: true });
    try {
      let values = await validate();
      values.userIdentity === 1 && (values.departIds = '');
      let isUpdateVal = unref(isUpdate);
      // -update-begin--author:liaozhiyang---date:20240702---for：【TV360X-1737】部门用户编辑接口，增加参数updateFromPage:"deptUsers"
      let params = values;
      console.log('params', params);
      const assignId = currentEditRecordRef.value?.assignId || '';
      const addFileList: any[] = [];
      // const deleteFileIdList:string[] = [];
      // let idx = 0;
      // 文件/视频
      if (uploadFileList.length > 0) {
        uploadFileList
          .filter((item) => !item.id)
          .forEach((item: UploadFileItem) => {
            // 新增
            addFileList.push({
              assignId: assignId,
              fileKey: item.url,
              fileName: item.name,
              id: null,
              remark: '',
              type: '1', // 1 file
            });
          });
      }
      // if(typeof params.file === 'string' && params.file) {
      //   params.file.split(',').forEach((item) => {
      //     item = item.trim();
      //     if(!item) return;
      //     let resInfo:any = null;
      //     respFileList.forEach((fileItem) => {
      //       if(fileItem.fileKey === item) {
      //         resInfo = fileItem;
      //       }
      //     });
      //     if(!resInfo) {
      //     //   addFileList.push({
      //     //     assignId: assignId,
      //     //     fileKey: resInfo.fileKey,
      //     //     fileName: resInfo.fileName,
      //     //     id: resInfo.id,
      //     //     remark: resInfo.remark || '',
      //     //     type: '1' // file
      //     //   });
      //     // } else {
      //       addFileList.push({
      //         assignId: assignId,
      //         fileKey: item,
      //         fileName: item,
      //         id: null,
      //         remark: '',
      //         type: '1' // file
      //       });
      //     }
      //   });
      // }
      // // 判断是否有文件删除
      // if(params.fileDelete) {
      //   params.fileDelete.split(',').forEach((item) => {
      //     item = item.trim();
      //     if(!item) return;
      //     respFileList.forEach((fileItem) => {
      //       if(fileItem.fileKey === item) {
      //         deleteFileIdList.push(fileItem.id);
      //       }
      //     });
      //   });
      // }
      // 图片
      if (uploadImageList.length > 0) {
        uploadImageList
          .filter((item) => !item.id)
          .forEach((item: UploadFileItem) => {
            // 新增
            addFileList.push({
              assignId: assignId,
              fileKey: item.url,
              fileName: item.name,
              id: null,
              remark: '',
              type: '2', // 2 image
            });
          });
      }
      // if(typeof params.image === 'string' && params.image) {
      //     params.image.split(',').forEach((item) => {
      //       item = item.trim();
      //       // if(!item) return;
      //        let resInfo:any = null;
      //       respFileList.forEach((fileItem) => {
      //         if(fileItem.fileKey === item) {
      //           resInfo = fileItem;
      //         }
      //       });
      //       if(!resInfo) {
      //       //   addFileList.push({
      //       //     assignId: assignId,
      //       //     fileKey: resInfo.fileKey,
      //       //     fileName: resInfo.fileName,
      //       //     id: resInfo.id,
      //       //     remark: resInfo.remark || '',
      //       //     type: '2' // 2 image
      //       //   });
      //       // } else{
      //         // 处理图片
      //         addFileList.push({
      //             assignId: assignId,
      //             fileKey: item,
      //             fileName: item,
      //             id: null,
      //             remark: '',
      //             type: '2' // 2 image
      //           });
      //       }
      //     });
      // }
      // 判断是否有图片删除
      // if(params.imageDelete) {
      //   params.imageDelete.split(',').forEach((item) => {
      //     item = item.trim();
      //     if(!item) return;
      //     respFileList.forEach((fileItem) => {
      //       if(fileItem.fileKey === item) {
      //         deleteFileIdList.push(fileItem.id);
      //       }
      //     });
      //   });
      // }
      // 音频
      if (uploadAudioList.length > 0) {
        uploadAudioList
          .filter((item) => !item.id)
          .forEach((item: UploadFileItem) => {
            // 新增
            addFileList.push({
              assignId: assignId,
              fileKey: item.url,
              fileName: item.name,
              id: null,
              remark: '',
              type: '3', // 3 audio
            });
          });
      }
      // if(typeof params.audio === 'string' && params.audio) {
      //   params.audio.split(',').forEach((item) => {
      //     item = item.trim();
      //     if(!item) return;
      //     let resInfo:any = null;
      //     respFileList.forEach((fileItem) => {
      //       if(fileItem.fileKey === item) {
      //         resInfo = fileItem;
      //       }
      //     });
      //     if(!resInfo) {
      //     //   addFileList.push({
      //     //     assignId: assignId,
      //     //     fileKey: resInfo.fileKey,
      //     //     fileName: resInfo.fileName,
      //     //     id: resInfo.id,
      //     //     remark: resInfo.remark || '',
      //     //     type: '3' // 3 audio
      //     //   });
      //     // } else {
      //       // 处理音频
      //       addFileList.push({
      //         assignId: assignId,
      //         fileKey: item,
      //         fileName: item,
      //         id: null,
      //         remark: '',
      //         type: '3' // 3 audio
      //       });
      //     }
      //   });
      // }
      // 判断是否有音频删除
      // if(params.audioDelete) {
      //   params.audioDelete.split(',').forEach((item) => {
      //     item = item.trim();
      //     if(!item) return;
      //     respFileList.forEach((fileItem) => {
      //       if(fileItem.fileKey === item) {
      //         deleteFileIdList.push(fileItem.id);
      //       }
      //     });
      //   });
      // }
      // 判断文件列表是否为空
      if (addFileList.length === 0 && respFileList.length === 0) {
        createMessage.error('上传附件不能为空，必选上传其中任意一种！');
        setModalProps({ confirmLoading: false });
        return;
      }
      // 优先保存区级信息
      try {
        if (currentEditRecordRef.value) {
          const preParams = await preReplyValidate();
          const resResult = await savePreReply({
            deleteFileIdList: [],
            replyFileList: [],
            ticketId: currentEditRecordRef.value?.id,
            ticketReplyDataVo: {
              ...preParams,
            },
          });
          console.log('保存预回复信息成功', resResult);
        }
      } catch (error) {
        console.error('保存区级信息失败', error);
      }

      const newParams = {
        addFileList: addFileList,
        assignId: assignId,
        deleteFileIdList: deleteFileIdList,
        overseeUserName: params.overseeUserName,
        overseeUserPhone: '',
        remark: params.remark,
        replyAudioDuration: 0,
        replyAudioNote: '',
        resolveResult: params.resolveResult,
        replyFact: params.replyFact, // 是否属实
        replyResolve: params.replyResolve, // 是否解决
        replySatisfy: params.replySatisfy, // 是否满意
        retainFlag: params.retainFlag, // 是否保留
      };
      try {
        if (tp === '2') {
          // 执行社区审核操作
          await saveSubmitReply(newParams);
          createMessage.info('提交成功');
        } else {
          await addDepartReply(newParams);
          createMessage.info('保存成功');
        }
      } catch (error) {
        console.error('提交失败', error);
      }
      setTimeout(() => {
        closeModal();
      }, 2000);
      //刷新列表
    } catch (error) {
      console.error('表单验证失败', error);
    }
    setModalProps({ confirmLoading: false });
  }
</script>
