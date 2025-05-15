<template>
  <div class="upload-list-container">
    <!-- 附件区域 -->
    <div class="upload-header flex justify-between items-center mb-2">
      <div class="flex items-center">
        <!-- <span class="text-red-500 mr-1">*</span>
        <span>附件：</span> -->
        <span class="text-red-500 text-sm ml-2" v-if="props.required && fileList.length === 0">请上传附件</span>
      </div>

      <!-- 上传按钮 -->
      <div class="flex">
        <a-button type="primary" @click="handleAddClick" class="flex items-center">
          <PlusOutlined />
          <span>添加</span>
        </a-button>
        <a-button @click="toggleExpand" class="ml-2">
          <DownOutlined v-if="!expanded" />
          <UpOutlined v-else />
        </a-button>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="expanded" class="upload-list-table bg-white rounded">
      <a-table 
        :dataSource="fileList" 
        :columns="columns" 
        :pagination="false" 
        :rowKey="record => record.id || record.uid"
        :rowSelection="rowSelection"
        size="small"
      >
        <!-- 文件名列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fileName'">
            <div class="flex items-center">
              <span>{{ record.fileName }}</span>
              <PaperClipOutlined v-if="record.fileKey" class="ml-1 text-gray-400" />
            </div>
          </template>

          <!-- 市级附件类型列 -->
          <template v-if="column.key === 'fileTagType'">
            <a-select
              v-model:value="record.fileTagType"
              style="width: 100%"
              placeholder="请选择市级附件类型"
              :options="cityFileTypeOptions"
              @change="(val) => handleTypeChange(val, record, 'city')"
            ></a-select>
          </template>

          <!-- 区级附件类型列 -->
          <template v-if="column.key === 'districtFileTagType'">
            <a-select
              v-model:value="record.districtFileTagType"
              style="width: 100%"
              placeholder="请选择区级附件类型"
              :options="districtFileTypeOptions"
              @change="(val) => handleTypeChange(val, record, 'district')"
            />
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex space-x-2">
              <a-button type="link" @click="handlePreview(record)" class="text-blue-500">查看</a-button>
              <a-button v-if="!readOnly" type="link" @click="handleDownload(record)" class="text-blue-500">下载</a-button>
              <a-button v-if="!readOnly" type="link" @click="handleDelete(record)" class="text-red-500">删除</a-button>
            </div>
          </template>
        </template>
      </a-table>

      <div class="flex justify-between p-3 border-t">
        <div>已选择 {{ selectedRowKeys.length }} 项</div>
        <a-button v-if="selectedRowKeys.length > 0" @click="handleBatchDownload" class="download-btn">下载</a-button>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:visible="uploadModalVisible"
      title="文件提交"
      :width="800"
      @ok="handleUploadOk"
      @cancel="handleUploadCancel"
      :closable="true"
      :maskClosable="false"
    >
      <div class="upload-modal-content">
        <a-table 
          :dataSource="uploadedFiles" 
          :columns="uploadColumns" 
          :pagination="false"
          :rowKey="record => record.uid || record.id"
        >
          <!-- 文件名列 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fileName'">
              <div>{{ record.fileName || record.name }}</div>
            </template>

            <!-- 市级附件类型列 -->
            <template v-if="column.key === 'fileTagType'">
              <a-select
                v-model:value="record.fileTagType"
                style="width: 100%"
                placeholder="请选择"
                :options="cityFileTypeOptions"
              />
            </template>

            <!-- 区级附件类型列 -->
            <template v-if="column.key === 'districtFileTagType'">
              <a-select
                v-model:value="record.districtFileTagType"
                style="width: 100%"
                placeholder="请选择"
                :options="districtFileTypeOptions"
              />
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <div class="flex space-x-2">
                <a-button type="link" @click="handlePreview(record)" class="text-blue-500">查看</a-button>
                <a-button type="link" @click="handleRemoveUpload(record)" class="text-red-500">删除</a-button>
              </div>
            </template>
          </template>
        </a-table>

        <!-- 上传组件 -->
        <div class="mt-4">
          <a-upload-dragger
            v-model:fileList="draggerFiles"
            :multiple="true"
            name="file"
            :beforeUpload="beforeUpload"
            :showUploadList="false"
            @change="handleUploadChange"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint text-xs">
              支持单个或批量上传，文件大小不超过20MB，支持的格式：pdf, doc, docx, xls, xlsx, txt, png, jpg, jpeg, mp3, mp4...
            </p>
          </a-upload-dragger>
        </div>
      </div>
    </a-modal>

    <!-- 文件预览弹窗 -->
    <a-modal
      v-model:visible="previewModalVisible"
      :title="previewFile?.fileName || '文件预览'"
      :width="800"
      :footer="null"
    >
      <div class="preview-container" style="height: 500px; overflow: auto;">
        <!-- 图片预览 -->
        <img
          v-if="isImageFile(previewFile)"
          :src="previewUrl"
          class="max-w-full max-h-full mx-auto"
          alt="预览图片"
        />
        <!-- PDF预览 -->
        <iframe
          v-else-if="isPdfFile(previewFile)"
          :src="previewUrl"
          class="w-full h-full"
          frameborder="0"
        ></iframe>
        <!-- 其他文件 -->
        <div v-else class="text-center p-8">
          <FileOutlined class="text-6xl text-gray-300 mb-4" />
          <p>该文件类型不支持在线预览，请下载后查看</p>
          <a-button type="primary" @click="handleDownload(previewFile)" class="mt-4">下载文件</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts" name="UploadList">
import { ref, computed, onMounted, watch, PropType } from 'vue';
//@ts-ignore
import { 
  PlusOutlined, 
  DownOutlined,
  UpOutlined, 
  InboxOutlined, 
  PaperClipOutlined,
  FileOutlined
} from '@ant-design/icons-vue';
// import { message } from 'ant-design-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { uploadFile as uploadFileApi } from '/@/api/common/api';

// 定义文件类型接口
interface FileItem {
  id?: number | string;
  uid?: string;
  fileName: string;
  fileSize: number;
  fileKey: string;
  fileTagType: number | null;
  districtFileTagType: number | null;
  sourcePage?: number;
  name?: string;
  status?: string;
  type?: string;
}

// 组件属性定义
const props = defineProps({
  value: {
    type: Array as PropType<FileItem[]>,
    default: () => []
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  maxSize: {
    type: Number,
    default: 20 // 默认20MB
  },
  accept: {
    type: String,
    default: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.aac,.wma,.cda,.flac,.mid,.mka,.mp2,.mpa,.mpc,.ape,.ofr,.ogg,.ra,.wv,.tta,.ac3,.dts,.mp3,.mp4,.m4a,.zip,.wav,.rar'
  }
});

const emit = defineEmits(['update:value', 'change']);

// 创建消息实例
const { createMessage } = useMessage();

// 数据初始化
const fileList = ref<FileItem[]>([]);
const expanded = ref(true);
const uploadModalVisible = ref(false);
const previewModalVisible = ref(false);
const previewFile = ref<FileItem | null>(null);
const previewUrl = ref('');
const selectedRowKeys = ref<(string | number)[]>([]);
const uploadedFiles = ref<FileItem[]>([]);
const draggerFiles = ref<any[]>([]);

// 表格列定义
const columns = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
    width: '25%',
  },
  {
    title: '大小 (kb)',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: '15%',
    customRender: ({ text }) => {
      return text ? (text / 1024).toFixed(2) : '0';
    }
  },
  {
    title: '市级附件类型',
    dataIndex: 'fileTagType',
    key: 'fileTagType',
    width: '20%',
  },
  {
    title: '区级附件类型',
    dataIndex: 'districtFileTagType',
    key: 'districtFileTagType',
    // width: '20%',
  },
  {
    title: '操作',
    key: 'action',
    width: '200',
  },
];

// 上传弹窗表格列
const uploadColumns = [
  {
    title: '附件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    required: true,
    width: '30%',
  },
  {
    title: '大小 (kb)',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: '15%',
    customRender: ({ text, record }) => {
      const size = record.fileSize || record.size || 0;
      return (size / 1024).toFixed(2);
    }
  },
  {
    title: '市级附件类型',
    dataIndex: 'fileTagType',
    key: 'fileTagType',
    width: '20%',
  },
  {
    title: '区级附件类型',
    dataIndex: 'districtFileTagType',
    key: 'districtFileTagType',
    width: '20%',
  },
  {
    title: '操作',
    key: 'action',
    width: '15%',
  },
];

// 选择框配置
const rowSelection = {
  onChange: (selectedRowKeys: (string | number)[], selectedRows: FileItem[]) => {
    selectedRowKeys.value = selectedRowKeys;
  },
  selectedRowKeys,
};

// 附件类型选项（示例）
const cityFileTypeOptions = [
  { label: '联系核实附件', value: 1 },
  { label: '处置过程附件', value: 2 },
  { label: '红头证明附件', value: 3 },
  { label: '回访信息附件', value: 4 },
];

const districtFileTypeOptions = [
  { label: '三办一签附件', value: 1 },
  { label: '录音', value: 2 },
];

// 监听props变化
watch(
  () => props.value,
  (newVal) => {
    if (newVal) {
      fileList.value = [...newVal];
    }
  },
  { immediate: true, deep: true }
);

// 监听文件列表变化
watch(
  fileList,
  (newVal) => {
    emit('update:value', newVal);
    emit('change', newVal);
  },
  { deep: true }
);

// 初始化
onMounted(() => {
  if (props.value && props.value.length > 0) {
    fileList.value = [...props.value];
  }
});

// 切换展开/折叠
const toggleExpand = () => {
  expanded.value = !expanded.value;
};

// 添加按钮点击
const handleAddClick = () => {
  if (props.readOnly) {
    createMessage.warning('当前为只读模式，不能上传文件');
    return;
  }
  uploadModalVisible.value = true;
  uploadedFiles.value = [];
  draggerFiles.value = [];
};

// 上传前检查
const beforeUpload = (file: File) => {
  // 检查文件类型
  const fileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
  const acceptTypes = props.accept.split(',').map(type => 
    type.trim().toLowerCase().replace('.', '')
  );
  
  if (!acceptTypes.includes(fileType)) {
    createMessage.error(`不支持的文件类型: ${fileType}`);
    return false;
  }

  // 检查文件大小
  const isLt20M = file.size / 1024 / 1024 < props.maxSize;
  if (!isLt20M) {
    createMessage.error(`文件必须小于 ${props.maxSize}MB!`);
    return false;
  }

  // 自定义上传逻辑
  return false;
};

// 处理文件上传变化
const handleUploadChange = async (info) => {
  console.log('上传文件信息:', info);
  const { file } = info;
  
  if (file.status !== 'uploading') {
    try {
      // 调用上传API
      // const formData = new FormData();
      // formData.append('file', file);
      
      const response = await uploadFileApi(info, (x:any) => {
        console.log(x);
      });
      console.log(response);
      if (response && response.success) {
        const fileData = response.result || {};
        
        // 构建文件项
        const newFile: FileItem = {
          uid: file.uid,
          fileName: file.name,
          fileSize: file.size,
          fileKey: fileData.fileKey || '',
          fileTagType: null,
          districtFileTagType: null,
        };
        
        // 添加到已上传文件列表
        uploadedFiles.value = [...uploadedFiles.value, newFile];
        createMessage.success(`${file.name} 上传成功`);
      } else {
        createMessage.error(`${file.name} 上传失败: ${response?.message || '未知错误'}`);
      }
    } catch (error:any) {
      console.error('文件上传错误:', error);
      createMessage.error(`${file.name} 上传失败: ${error?.message || '未知错误'}`);
    }
  }
};

// 提交上传的文件
const handleUploadOk = () => {
  if (uploadedFiles.value.length === 0) {
    createMessage.warning('请至少上传一个文件');
    return;
  }

  // 检查是否都选择了类型
  const hasEmptyType = uploadedFiles.value.some(file => 
    file.fileTagType === null || file.districtFileTagType === null
  );

  if (hasEmptyType) {
    createMessage.warning('请为所有文件选择市级和区级附件类型');
    return;
  }

  // 添加到文件列表
  fileList.value = [...fileList.value, ...uploadedFiles.value];
  uploadModalVisible.value = false;
  createMessage.success('文件提交成功');
};

// 取消上传
const handleUploadCancel = () => {
  uploadModalVisible.value = false;
  uploadedFiles.value = [];
  draggerFiles.value = [];
};

// 删除上传的文件（未提交）
const handleRemoveUpload = (file) => {
  uploadedFiles.value = uploadedFiles.value.filter(item => 
    item.uid !== file.uid && item.id !== file.id
  );
};

// 删除已提交文件
const handleDelete = (file) => {
  if (props.readOnly) return;
  
  fileList.value = fileList.value.filter(item => 
    (item.id && item.id !== file.id) || (item.uid && item.uid !== file.uid)
  );
  createMessage.success('文件删除成功');
};

// 文件预览
const handlePreview = (file) => {
  previewFile.value = file;
  
  // 在实际应用中，这里应该是通过fileKey获取真实的预览URL
  if (file.fileKey) {
    // 模拟获取预览URL，实际应该调用API
    previewUrl.value = `/api/file/preview/${file.fileKey}`;
  } else {
    previewUrl.value = '';
  }
  
  previewModalVisible.value = true;
};

// 文件下载
const handleDownload = (file) => {
  if (!file || !file.fileKey) {
    createMessage.warning('文件不存在或无法下载');
    return;
  }
  
  // 模拟文件下载，实际应该调用API
  const downloadUrl = `/api/file/download/${file.fileKey}`;
  window.open(downloadUrl);
};

// 批量下载
const handleBatchDownload = () => {
  if (selectedRowKeys.value.length === 0) {
    createMessage.warning('请先选择要下载的文件');
    return;
  }
  
  // 实现批量下载逻辑
  createMessage.success(`正在下载 ${selectedRowKeys.value.length} 个文件`);
  // 实际应该调用API
};

// 附件类型变更
const handleTypeChange = (value, record, type) => {
  // 更新对应的文件类型
  if (type === 'city') {
    record.fileTagType = value;
  } else {
    record.districtFileTagType = value;
  }
};

// 判断是否为图片文件
const isImageFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
};

// 判断是否为PDF文件
const isPdfFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  return name.toLowerCase().endsWith('.pdf');
};
</script>

<style scoped>
.upload-list-container {
  width: 100%;
}

.upload-header {
  padding: 8px;
}

.upload-list-table {
  border: 1px solid #f0f0f0;
}

.download-btn {
  color: #1890ff;
  border-color: #1890ff;
}
</style>