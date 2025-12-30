<!-- 回复列表组件 -->
<template>
  <div :class="['reply-list-container', { 'table-weixin': isWeixinH5(), 'width-300': isWeixinH5() }]">
    <a-table 
      :dataSource="localReplyList" 
      :columns="columns" 
      :pagination="false"
      :loading="loading"
      :bordered="true"
      @change="handleTableChange"
      rowKey="id"
      size="middle"
    >
      <!-- 社区/部门列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'department'">
          {{ record.orgName }}
        </template>
        
        <!-- 回复内容列 -->
        <template v-if="column.key === 'content'">
          <div class="content-ellipsis" :title="record.resolveResult">{{ record.resolveResult }}</div>
        </template>
        <!-- 是否联系 -->
        <template v-if="column.key === 'replyContact'">
          {{ getReplyContactText(record.replyContact) }}
        </template>
        <!-- 是否解决 -->
        <template v-if="column.key === 'replyResolve'">
          {{ record.replyResolve == '1' ? '是' : (record.replyResolve == '0' ? '否' : '') }}
        </template>
        <!-- 是否满意 -->
        <template v-if="column.key === 'replySatisfy'">
          {{ record.replySatisfy == '1' ? '是'  : (record.replySatisfy == '0' ? '否' : '') }}
        </template>
         <!-- 是否属实 -->
        <template v-if="column.key === 'replyFact'">
          {{ record.replyFact == '1' ? '是' : (record.replyFact == '0' ? '否' : '') }}
        </template>
        <!-- 视频/文件个数列 -->
        <template v-if="column.key === 'fileCount'">
          <a-button 
            type="link" 
            size="small"
            @click="handleViewFiles(record, 'file')"
            v-if="record.fileCount > 0"
          >
            {{ record.fileCount }}
          </a-button>
          <span v-else>0</span>
        </template>
        
        <!-- 图片个数列 -->
        <template v-if="column.key === 'imageCount'">
          <a-button 
            type="link" 
            size="small"
            @click="handleViewFiles(record, 'image')"
            v-if="record.imageCount > 0"
          >
            {{ record.imageCount }}
          </a-button>
          <span v-else>0</span>
        </template>
        
        <!-- 音频个数列 -->
        <template v-if="column.key === 'audioCount'">
          <a-button 
            type="link" 
            size="small"
            @click="handleViewFiles(record, 'audio')"
            v-if="record.audioCount > 0"
          >
            {{ record.audioCount }}
          </a-button>
          <span v-else>0</span>
        </template>
        
        <!-- 审核列 -->
        <template v-if="column.key === 'audit'">
          <a-select
            v-if="!props.readOnly"
            v-model:value="record.auditStatus"
            placeholder="请选择"
            style="width: 100px"
            :options="auditOptions"
            @change="(value) => handleAuditChange(value, record)"
          />
          <span v-else>
            <a-tag color="cyan">
              {{ getAuditStatusText(record.auditStatus) }}
            </a-tag>
            </span>
        </template>
        
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleViewDetail(record)">详情</a-button>
        </template>
      </template>
    </a-table>
    
    <!-- 文件列表弹窗 -->
    <!-- <a-modal
      v-model:visible="fileModalVisible"
      :title="getFileModalTitle"
      :width="700"
      :footer="null"
      @cancel="handleFileModalCancel"
    >
      <UploadList :value="currentFileList" readOnly />
    </a-modal> -->
    
    <!-- 拒绝原因弹窗 -->
    <a-modal
      v-model:visible="rejectModalVisible"
      title="填写拒绝原因"
      :width="500"
      @ok="handleRejectSubmit"
      @cancel="handleRejectCancel"
      :okButtonProps="{ loading: rejectSubmitLoading }"
      destroyOnClose
    >
      <div class="flex w-full pt-6">
         <a-form 
            :model="rejectForm" 
            style="width: 100%"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
         >
            <a-form-item 
            label="拒绝原因" 
            name="reason" 
            :rules="[{ required: true, message: '请填写拒绝原因' }]"
            >
            <a-textarea 
                v-model:value="rejectForm.reason" 
                placeholder="请输入拒绝原因" 
                :rows="4" 
                :style="{ width: '100%' }"
            />
            </a-form-item>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="回复详情"
      :width="800"
      :footer="null"
      @cancel="handleDetailModalCancel"
    >
      <a-descriptions bordered :labelStyle="{ minWidth: '120px' }" :column="isWeixinH5() ? 1 : 2" size="middle">
        <a-descriptions-item label="工单编号">
          {{ currentDetail.ticketId }}
        </a-descriptions-item>
        <a-descriptions-item label="诉求人">
          {{ currentDetail.callUserName }}
        </a-descriptions-item>
        <a-descriptions-item label="联系方式">
          {{ currentDetail.callPhoneNumber }}
        </a-descriptions-item>
        <a-descriptions-item label="诉求内容">
          {{ currentDetail.mainContent }}
        </a-descriptions-item>
        <a-descriptions-item label="社区/部门">
          {{ currentDetail.orgName }}
        </a-descriptions-item>
        <a-descriptions-item label="督办人">
          {{ currentDetail.overseeUserName }}
        </a-descriptions-item>
        <a-descriptions-item label="回复时间">
          {{ currentDetail.replyTime }}
        </a-descriptions-item>
        <a-descriptions-item label="回复内容">
          <div class="whitespace-pre-wrap">{{ currentDetail.resolveResult }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="文件/视频">
          <BasicUploadItem v-if="currentDetail.fileList?.length > 0" :showUpload="false" :showDelete="false" :value="currentDetail.fileList" readOnly />
          <span v-else>无</span>
        </a-descriptions-item>
        <a-descriptions-item label="图片">
          <BasicUploadItem v-if="currentDetail.imageList?.length > 0" :showUpload="false" :showDelete="false" :value="currentDetail.imageList" readOnly />
          <span v-if="!currentDetail.imageList?.length">无</span>
        </a-descriptions-item>
        <a-descriptions-item label="音频">
          <BasicUploadItem v-if="currentDetail.audioList?.length > 0" :showUpload="false" :showDelete="false" :value="currentDetail.audioList" readOnly />
          <span v-if="!currentDetail.audioList?.length">无</span>
        </a-descriptions-item>
        <!-- <a-descriptions-item label="督办人">
          {{ currentDetail.overseeUser }}
        </a-descriptions-item> -->
        <a-descriptions-item label="审核状态">
          <a-tag color="cyan">
            {{ getAuditStatusText(currentDetail.auditStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentDetail.auditStatus === -1" label="拒绝原因">
          {{ currentDetail.rejectReason }}
        </a-descriptions-item>
      </a-descriptions>
      <!-- 三个是否的编辑表单 -->
      <div class="py-2">
       <a-divider orientation="left">编辑回复状态</a-divider>
       <div class="p-4">
         <BasicForm @register="registerForm"  />
       </div>
       <div class="p-4 flex justify-end"  v-if="canEditReplyStatus">
         <a-button type="primary" :loading="isSaving" @click="handleEditSave">保存</a-button>
       </div>
      </div>
    </a-modal>
    
    <!-- 文件预览 -->
    <UploadItemPreviewModal :value="previewFileList" :showDelete='false' @register="registerPreviewModal" />
  </div>
</template>

<script setup lang="ts" name="reply-record">
import { ref, computed, watch, PropType, h } from 'vue';
  import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
// @ts-ignore
import UploadList from '../../components/UploadList/index.vue';
import { BasicUploadItem } from '/@/components/UploadItem';
import UploadItemPreviewModal from '/@/components/UploadItem/src/UploadItemPreviewModal.vue';
import { audioTypes, imageTypes } from '/@/utils/fileType';
import { editReplyYesNoStatus, getComplaintDetail } from '/@/api/common/api';
import { BasicForm, useForm } from '/@/components/Form/index';
import { usePermission } from '/@/hooks/web/usePermission';
import { isWeixinH5 } from '/@/utils';
// 定义回复列表项类型
interface ReplyItem {
  id: string | number;
  department: string;
  content: string;
  fileCount: number;
  imageCount: number;
  audioCount: number;
  auditStatus: number | null;
  replyUser: string;
  replyTime: string;
  overseeUser: string;
  fileList?: any[];
  imageList?: any[];
  audioList?: any[];
  rejectReason?: string;
  [key: string]: any;
}

// 定义组件属性
const props = defineProps({
  // 工单ID，保留以便未来扩展
  ticketId: {
    type: [String, Number],
    default: ''
  },
  // 直接接收回复列表数据
  replyData: {
    type: Array as PropType<ReplyItem[]>,
    default: () => []
  },
  // 是否只读模式
  readOnly: {
    type: Boolean,
    default: false
  },
  // 总记录数
  total: {
    type: Number,
    default: 0
  },
  // 是否可以编辑回复状态
  canEditReply: {
    type: Boolean,
    default: false
  }
});
const contactOptions = [
  { label: '联系', value: '1' },
  { label: '未联系', value: '0' },
  // { label: '无法联系', value: '2' },
]

function getReplyContactText(value) {
  const option = contactOptions.find(item => item.value == value);
  return option ? option.label : '';
}

const { hasPermission } = usePermission();
// 定义组件事件
const emit = defineEmits(['auditChange', 'pageChange', 'replyStatusChange']);

// 消息实例
const { createMessage } = useMessage();
const canEditReplyStatus = computed(() => {
  return props.canEditReply && hasPermission(editAuthCode);
})
// 预览modal
const [registerPreviewModal, { openModal: openPreviewModal }] = useModal();
// 编辑是否状态的表单
const [registerForm, { setFieldsValue, clearValidate, validate, updateSchema }] = useForm({
    labelWidth: 150,
    schemas: [
      {
        field: 'replyContact',
        label: '是否联系',
        component: 'Select',
        componentProps: ({formActionType, formModel}) => ({
          placeholder: '请输入是否联系',
          // options: getDistrictDictItemsByCode('is_contact'),  // 需要从接口获取
          options: contactOptions,  // 固定选项
          allowClear: true,
          onChange: (value) => {
            const { updateSchema } = formActionType;
            // 处理变化 无法联系
            if(value == '2') {
              formModel['replyResolve'] = null; // 如果选择了联系，默认解决状态为已解决
              formModel['replySatisfy'] = null; // 如果选择了联系，默认满意状态为不满意
              // formModel['replyFact'] = null; // 如果选择了联系，默认属实状态为不属实
              updateSchema([
                {
                field: 'replyResolve',
                required: false,
              },
              {
                field: 'replySatisfy',
                required: false,
              }])
            } else {
              updateSchema([
                {
                  field: 'replyResolve',
                  required: true,
                },
                {
                  field: 'replySatisfy',
                  required: true,
                }])
            }
          }
        }),
        // required: true,
        colProps: { span: 6 },
        required: true
      },
      {
        field: 'replyResolve',
        label: '是否解决',
        component: 'RadioGroup',
        required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 6
        },
        // defaultValue: -1,
      },
      {
        field: 'replySatisfy',
        label: '是否满意',
        component: 'RadioGroup',
        required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 6
        },
        // defaultValue: -1,
      },
      {
        field: 'replyFact',
        label: '是否属实',
        component: 'RadioGroup',
        required: true,
        componentProps: {
          options: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
        },
        colProps: {
          span: 6
        }
      }, 
      {
       field: 'assignId',
       label: '是否属实',
       component: 'Input',
       show: false
      }
    ],
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 8 },
    //row行的样式
    baseRowStyle: { width: '100%', },
    disabled: !canEditReplyStatus.value
  });
// 预览文件列表
const previewFileList = ref<any[]>([]);
// 数据状态
const loading = ref(false);
const localReplyList = ref<ReplyItem[]>([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: props.total || 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`
});
// 编辑是否状态
const isSaving = ref<boolean>(false);
const editAuthCode = 'biz:complain:reply:editResolve'


// 弹窗状态
const fileModalVisible = ref(false);
const rejectModalVisible = ref(false);
const detailModalVisible = ref(false);
const currentFileType = ref('');
const currentReplyId = ref('');
const currentFileList = ref<any[]>([]);
const currentDetail = ref<any>({});
const rejectForm = ref({ reason: '' });
const rejectSubmitLoading = ref(false);
const previewImageList = ref<string[]>([]);
const isWeixin = isWeixinH5();

// 表格列定义
const columns = [
  {
    title: '社区/部门',
    dataIndex: 'orgName',
    key: 'department',
    width: isWeixin ? 100: '10%',
  },
  {
    title: '回复内容',
    dataIndex: 'resolveResult',
    key: 'content',
    width: '15%',
    ellipsis: true,
    minWidth: isWeixin ? 100: '100px',
  },
  {
    title: '是否联系',
    dataIndex: 'replyContact',
    key: 'replyContact',
    width: isWeixin ? 50: '9%'
  },
  {
    title: '是否解决',
    dataIndex: 'replyResolve',
    key: 'replyResolve',
    width: isWeixin ? 50: '9%'
  },
  {
    title: '是否满意',
    dataIndex: 'replySatisfy',
    key: 'replySatisfy',
    width: isWeixin ? 50: '9%'
  },
  {
    title: '是否属实',
    dataIndex: 'replyFact',
    key: 'replyFact',
    width: isWeixin ? 50: '9%'
  },
  {
    title: '文件/视频',
    dataIndex: 'fileCount',
    key: 'fileCount',
    width: isWeixin ? 50: '10%'
  },
  {
    title: '图片',
    dataIndex: 'imageCount',
    key: 'imageCount',
    width: isWeixin ? 50: '5%'
  },
  {
    title: '音频',
    dataIndex: 'audioCount',
    key: 'audioCount',
    width: isWeixin ? 50: '5%'
  },
  {
    // 红色星号表示必选
    title: h('span', [
      '审核状态',
      h('span', { class: 'text-red-500' }, '*')
    ]),
    dataIndex: 'auditStatus',
    key: 'audit',
    width: isWeixin ? 120: '12%'
  },
  {
    title: '操作',
    key: 'action',
    width: isWeixin ? 70: '7%'
  }
];

// 审核选项 -2未提交;-1未通过,0待审核,1通过
const auditOptions = [
  { label: '请选择', value: null },
  // { label: '未提交', value: -2 },
  { label: '拒绝', value: -1 },
  // { label: '待审核', value: 0 },
  { label: '通过', value: 1 }
];

// 文件弹窗标题
const getFileModalTitle = computed(() => {
  const typeText = {
    file: '文件/视频',
    image: '图片',
    audio: '音频'
  };
  return `${typeText[currentFileType.value] || '文件'}列表`;
});

// 获取审核状态文本
const getAuditStatusText = (status) => {
  switch (status) {
    case -2:
      return '未提交';
    case -1:
      return '拒绝';
    case 0:
      return '待审核';
    case 1:
      return '通过';
    default:
      return '未知状态';
  }
};

// 监听外部传入的回复数据变化
watch(() => props.replyData, (newValue) => {
  // 统计个类型文件的数量
  localReplyList.value = Array.isArray(newValue) ? newValue.map(v => {
    return {
      ...v,
      auditStatus: v.auditStatus || null,
    }
  }) : [];
  loading.value = false;
}, { deep: true, immediate: true });

// 监听外部传入的总数量变化
watch(() => props.total, (newValue) => {
  pagination.value.total = newValue || localReplyList.value.length;
}, { immediate: true });

// 表格变化事件处理
const handleTableChange = (pag) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  
  // 通知父组件页码变化，如果需要分页的话
  emit('pageChange', {
    current: pagination.value.current,
    pageSize: pagination.value.pageSize
  });
};

// 查看文件
const handleViewFiles = (record, type) => {
  console.log(record);
  currentFileType.value = type;
  currentReplyId.value = record.id;
  
  let fileList:any[] = [];
  let imageList:any[] = [];
  let audioList:any[] = [];
   // 分类，图片、音频、其他
  record.fileList.forEach((item:any) => {
     let fileType = item.fileName.split('.').pop();
      if (audioTypes.includes(fileType)) {
        audioList.push({
          id: item.id,
          name: item.fileName,
          status: 'done',
          url: item.fileKey,
          response: item, // 保留原始数据
        });
      } else if (imageTypes.includes(fileType)) {
        imageList.push({
          id: item.id,
          name: item.fileName,
          status: 'done',
          url: item.fileKey,
          response: item, // 保留原始数据
        });
      } else {
        fileList.push({
          id: item.id,
          name: item.fileName,
          status: 'done',
          url: item.fileKey,
          response: item, // 保留原始数据
        });
      }
    });
  // 根据类型获取不同的文件列表
  switch (type) {
  case 'file':

      currentFileList.value = fileList;
      break;
    case 'image':
      currentFileList.value = imageList;
      break;
    case 'audio':
      currentFileList.value = audioList;
      break;
    default:
      currentFileList.value = [];
  }
  // fileModalVisible.value = true;
  previewFileList.value = currentFileList.value
  openPreviewModal();
};

// 文件弹窗取消
const handleFileModalCancel = () => {
  previewFileList.value = [];
};

// 审核状态变化
const handleAuditChange = (value, record) => {
  if (props.readOnly) return;
  
  if (value === -1) {
    // 拒绝时弹出填写原因的弹窗
    currentReplyId.value = record.id;
    rejectForm.value.reason = '';
    rejectModalVisible.value = true;
  } else if (value === 1) {
    // 直接通过，调用审核接口
    submitAudit(record.id, 1);
  }
};

// 提交审核
const submitAudit = async (replyId, status, reason = '') => {
  try {
    // 更新本地数据状态
    const reply = localReplyList.value.find(item => item.id === replyId);
    if (reply) {
      reply.auditStatus = status;
      if (status === -1) {
        reply.rejectReason = reason;
      }
    }
    
    createMessage.success(`审核${status === 1 ? '通过' : '拒绝'}成功`);
    
    // 触发审核变更事件
    emit('auditChange', { 
      id: replyId, 
      status, 
      reason,
      record: reply 
    });
  } catch (error) {
    console.error('审核失败', error);
    createMessage.error('审核失败');
  }
};

// 提交拒绝原因
const handleRejectSubmit = async () => {
  if (!rejectForm.value.reason.trim()) {
    createMessage.warning('请填写拒绝原因');
    return;
  }
  // 更新到 localReplyList
  const reply = localReplyList.value.find(item => item.id === currentReplyId.value);
  if (reply) {
    reply.auditStatus = -1;
    reply.rejectReason = rejectForm.value.reason;
    emit('auditChange', { 
      id: currentReplyId.value, 
      status: -1, 
      reason: rejectForm.value.reason,
      record: reply 
    });
  }
  rejectModalVisible.value = false;
};

// 取消拒绝
const handleRejectCancel = () => {
  rejectModalVisible.value = false;
  // 重置选中的回复的审核状态
  const reply = localReplyList.value.find(item => item.id === currentReplyId.value);
  if (reply) {
    reply.auditStatus = null;
  }
};

// 查看详情
const handleViewDetail = (record) => {
  console.log('handleViewDetail:', record)
  currentDetail.value = { ...record };
  detailModalVisible.value = true;
  
   let fileList:any[] = [];
  let imageList:any[] = [];
  let audioList:any[] = [];
   // 分类，图片、音频、其他
  record.fileList.forEach((item:any) => {
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
  // 根据类型获取不同的文件列表
  currentDetail.value.fileList = fileList;
  currentDetail.value.imageList = imageList;
  currentDetail.value.audioList = audioList;
  // 准备图片预览数据
  if (record.imageList && record.imageList.length > 0) {
    previewImageList.value = record.imageList.map(img => img.url);
  }
  // 根据ticketId查询工单详情
  getComplaintDetail(record?.ticketId).then((res) => {
    // 如果返回数据存在
     console.log('工单详情', res);
    if (res) {
      // 工单编号
      currentDetail.value.workOrderNumber = res.workOrderNumber || '';
      // 诉求人
      currentDetail.value.callUserName = res.callUserName || '';
      // 联系方式
      currentDetail.value.callPhoneNumber = res.callPhoneNumber || '';
      // 诉求内容
      currentDetail.value.mainContent = res.mainContent || '';
    } else {
      createMessage.error('获取工单详情失败');
    }
  }).catch(() => {
    createMessage.error('获取工单详情失败');
  });
  setTimeout(() => {
    // 回显是否展示
    setFieldsValue({
      assignId: record.id, // id 赋值
      replyContact: record.replyContact !== undefined ? `${record.replyContact}`: null,
      replyFact: record.replyFact !== undefined ?  record.replyFact: null,
      replyResolve: record.replyResolve !== undefined ?  record.replyResolve: null,
      replySatisfy: record.replySatisfy !== undefined ?  record.replySatisfy: null
    });
      if(record.replyContact == '2') {
        updateSchema([
          {
          field: 'replyResolve',
          required: false,
        },
        {
          field: 'replySatisfy',
          required: false,
        }])
      } else {
        updateSchema([
          {
            field: 'replyResolve',
            required: true,
          },
          {
            field: 'replySatisfy',
            required: true,
          }])
      }
    // 清楚首次验证
    clearValidate();
  },100)
};

// 详情弹窗关闭
const handleDetailModalCancel = () => {
  detailModalVisible.value = false;
};

// 图片预览
const previewImage = (url) => {
  // a-image 组件会自动处理预览
};

// 保存是否状态结果
async function handleEditSave() {
  const values = await validate();
  if(isSaving.value) return;
  isSaving.value = true;
  const res = await editReplyYesNoStatus({
    "assignId": values.assignId,
    "replyContact": values.replyContact,
    "replyFact": values.replyFact,
    "replyResolve": values.replyResolve,
    "replySatisfy": values.replySatisfy
  })
  console.log('handleEditSave', res);
  isSaving.value = false;
  createMessage.success('状态保存成功!');
    // 更新本地数据状态
  emit('replyStatusChange', { values });
  // 更新localReplyList
  localReplyList.value = localReplyList.value.map(item => {
    if (item.id == values.assignId) {
      return { ...item, ...values };
    }
    return item;
  });
  handleDetailModalCancel();
}
</script>

<style scoped>
.reply-list-container {
  padding: 16px 0;
}

.content-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.image-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.audio-item audio {
  width: 100%;
  max-width: 300px;
}
</style>