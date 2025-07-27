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
      <div class="flex gap-2">
        <!-- 从已有列表上传 -->
        <a-button v-if="showReplySelectBtn" :disabled="readOnly" @click="handleUploadFromList" class="flex items-center">
          <span>从回复记录添加</span>
        </a-button>
        <!-- 添加 -->
        <a-button :disabled="readOnly" type="primary" @click="handleAddClick" class="flex items-center">
          <PlusOutlined />
          <span>添加</span>
        </a-button>
        <a-button :disabled="readOnly" @click="toggleExpand" class="ml-2">
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
          <!-- <template v-if="column.key === 'fileName'">
            <div class="flex items-center">
              <span>{{ record.fileName }}</span>
              <PaperClipOutlined v-if="record.fileKey" class="ml-1 text-gray-400" />
            </div>
          </template> -->
          <!-- 文件名称 -->
          <template v-if="column.key === 'fileName'">
            <div class="flex items-center">
              <a-input v-model:value="record.fileName" :maxLength="200"/>
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
            >
            </a-select>
          </template>

          <!-- 区级附件类型列 -->
          <template v-if="column.key === 'districtFileTagType'">
            <a-select
              v-model:value="record.districtFileTagType"
              style="width: 100%"
              placeholder="请选择区级附件类型"
              :options="districtFileTypeOptions"
            />
          </template>

          <template v-if="column.key === 'action'">
            <a-space :size="'small'">
             
              <a-button type="link" style="padding: 4px 0px" @click="handlePreview(record)" class="text-blue-500">查看</a-button>
              <a-button type="link" style="padding: 4px 0px" @click="handleDownload(record)" class="text-blue-500">下载</a-button>
              <a-button v-if="!readOnly" type="link" style="padding: 4px 0px" @click="handleDelete(record)" class="text-red-500">删除</a-button>
            </a-space>
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
          :rowKey="(record => record.uid || record.id)"
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
      :destroyOnClose="true"
    >
      <div class="preview-container flex justify-center" style="max-height: 750px; overflow: auto;">
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
        <!-- 音频预览 -->
        <audio
          v-else-if="isAudioFile(previewFile)"
          controls="true"
          autoplay="true"
          class="w-full"
        >
          <source :src="previewUrl">
          您的浏览器不支持音频播放
        </audio>
        <!-- 视频预览 -->
        <video
          v-else-if="isVideoFile(previewFile)"
          controls="true"
          class="w-full h-full"
        >
          <source :src="previewUrl">
          您的浏览器不支持视频播放
        </video>
        <!-- 其他文件 -->
        <div v-else class="text-center p-8">
          <FileOutlined class="text-6xl text-gray-300 mb-4" />
          <p>该文件类型不支持在线预览，请下载后查看</p>
          <a-button type="primary" @click="handleDownload(previewFile)" class="mt-4">下载文件</a-button>
        </div>
      </div>
    </a-modal>
    <!-- 从回复记录的附件里选择文件 -->
    <a-modal
      v-model:visible="replyFileListModalVisible"
      :title="'回复记录附件选择'"
      :width="800"
      :footer="null"
    >
      <div class="bg-transparent p-2 max-h-[400px] overflow-auto">
        <a-alert :message="`已选择：${selectedReplyRowKeys.length}，重复项在添加时将被自动忽略`" type="warning" class="mb-4" show-icon />
        <a-table 
          :dataSource="replyFileList" 
          :columns="replyColumns" 
          :pagination="false"
          :rowKey="'fileKey'"
          :rowSelection="{
            type: 'checkbox',
            selectedRowKeys: selectedReplyRowKeys,
            onChange: changeReplyRowSelect,
          }"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fileName'">
              <a-button type="link" @click="handlePreview(record)">{{ record.fileName || record.name }}</a-button>
            </template>
          </template>
        </a-table>
        <div class="flex justify-end mt-4">
          <a-button type="primary" :disabled="selectedReplyRowKeys.length === 0" @click="handleSelectReplyFiles">确定选择</a-button>
          <a-button class="ml-2" @click="replyFileListModalVisible = false">取消</a-button>
        </div>
      </div>
  </a-modal>
  </div>
</template>

<script setup lang="ts" name="UploadList">
import { ref, onMounted, watch, defineModel, defineProps, PropType, unref } from 'vue';
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
import { audioTypes, imageTypes, videoTypes } from '/@/utils/fileType';

// 定义文件类型接口
interface FileItem {
  id?: number | string;
  uid?: string;
  fileName: string;
  fileSize: number;
  fileKey: string;
  fileTagType: number | null;
  districtFileTagType: number | string | null;
  sourcePage?: number;
  name?: string;
  status?: string;
  type?: string;
}

// 组件属性定义
const props = defineProps({
  // value: {
  //   type: Array as PropType<FileItem[]>,
  //   default: () => []
  // },
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
    default: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.aac,.wma,.cda,.flac,.mid,.mka,.mp2,.mpa,.mpc,.ape,.ofr,.ogg,.ra,.wv,.tta,.ac3,.dts,.mp3,.mp4,.m4a,.wav'
  },
  // 回复附件列表
  replyFileList: {
    type: Array as PropType<FileItem[]>,
    default: () => []
  },
  // 展示回复选择按钮
  showReplySelectBtn: {
    type: Boolean,
    default: true
  }
});
const modelValue = defineModel('value', {
  type: Array as PropType<FileItem[]>,
  default: () => []
});
const emit = defineEmits(['change','delete']);

// 创建消息实例
const { createMessage } = useMessage();

// 数据初始化
const fileList = ref<FileItem[]>([]);
const expanded = ref(true);
const uploadModalVisible = ref(false);
const previewModalVisible = ref(false);
const previewFile = ref<FileItem | null>(null);
const previewUrl = ref('');
const selectedRowKeys = ref<any[]>([]);
const uploadedFiles = ref<FileItem[]>([]);
const draggerFiles = ref<any[]>([]);

// 回复记录附件选择
const replyFileListModalVisible = ref(false);
// const replyFileList = ref<FileItem[]>([]); // 假设从API获取的
const selectedReplyRowKeys = ref<(string | number)[]>([]);
const replyColumns = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
  },
  // {
  //   title: '大小 (kb)',
  //   dataIndex: 'fileSize',
  //   key: 'fileSize',
  //   width: '100',
  //   customRender: ({ text }) => {
  //     return text ? (text / 1024).toFixed(2) : '0';
  //   }
  // },
];
// 监听文件列表变化
function changeReplyRowSelect(selectedRowKeys: (string | number)[], selectedRows: FileItem[]) {
  selectedReplyRowKeys.value = selectedRowKeys;
  console.log('选中的回复记录附件:', selectedRows);
}
// 选择回复记录附件
function handleSelectReplyFiles() {
  if (selectedReplyRowKeys.value.length === 0) {
    createMessage.warning('请至少选择一个回复记录附件');
    return;
  }
  
  // 将选中的回复记录附件添加到文件列表
  const selectedFiles = props.replyFileList.filter(file => 
    selectedReplyRowKeys.value.includes(file.fileKey)
  ).map(file => ({
    ...file,
    fileTagType: file.fileTagType || 2, // 默认处置过程
    districtFileTagType: file.districtFileTagType || (isAudioFile(file) ? 2 : ''), // 录音类型默认选择
  }));
  
  // fileList.value = [...fileList.value, ...selectedFiles];
  // 去重，然后合并到 fileList
  const existingFileKeys = new Set(fileList.value.map(file => file.fileKey));
  const newFiles = selectedFiles.filter(file => !existingFileKeys.has(file.fileKey));
  fileList.value = [...fileList.value, ...newFiles];
  replyFileListModalVisible.value = false;
  createMessage.success('已选择回复记录附件');
}


// 表格列定义
const columns = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    key: 'fileName',
  },
  {
    title: '大小 (kb)',
    dataIndex: 'fileSize',
    key: 'fileSize',
    width: '100',
    customRender: ({ text }) => {
      return text ? (text / 1024).toFixed(2) : '0';
    }
  },
  {
    title: '市级附件类型',
    dataIndex: 'fileTagType',
    key: 'fileTagType',
    width: '100'
  },
  {
    title: '区级附件类型',
    dataIndex: 'districtFileTagType',
    key: 'districtFileTagType',
    width: '100',
  },
  {
    title: '操作',
    key: 'action',
    width: '150',
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
  onChange: (selRowKeys: string[]) => {
    selectedRowKeys.value = selRowKeys;
  },
  selectedRowKeys,
};

// 附件类型选项（示例）
const cityFileTypeOptions = [
  { label: '处置过程附件', value: 2 },
  { label: '联系核实附件', value: 1 },
  { label: '红头证明附件', value: 3 },
  { label: '回访信息附件', value: 4 },
];

const districtFileTypeOptions = [
  { label: '录音', value: 2 },
  { label: '三办一签附件', value: 1 },
  // { label: '其他', value: '' },
];

// // 监听props变化
// watch(
//   () => props.value,
//   (newVal, oldVal) => {
//     let hasChanges = false;
//     console.log('props.value变化:', newVal, oldVal);
//     try {
//       hasChanges = JSON.stringify(newVal) !== JSON.stringify(oldVal);
//     } catch (error) {
//       console.error('Error in watch:', error);
//     }
//     console.log('hasChanges:', hasChanges);
//     if (hasChanges) {
//       fileList.value = [...newVal];
//     }
//   },
//   { immediate: true, deep: true }
// );

// // 监听文件列表变化
// watch(
//   () => fileList.value,
//   (newVal, _oldVal) => {
//     // let hasChanges = false;
//     // console.log(newVal, oldVal);
//     // console.log(JSON.stringify(newVal), JSON.stringify(oldVal));
//     // try {
//     //   hasChanges = JSON.stringify(newVal) !== JSON.stringify(oldVal);
//     // } catch (error) {
//     //   console.error('Error in watch:', error);
//     // }
//     // if (!hasChanges) return;
//     let jsonStr:any = ''
//     try {
//       jsonStr = JSON.stringify(newVal);
//     } catch (error) {
//       console.error('Error converting fileList to JSON:', error);
//     }
//     console.log('文件列表变化:', newVal);
//     console.log('文件列表变化 JSON:', jsonStr);
//     // emit('update:value', newVal);
//     emit('change', newVal);
//     emit('update:modelValue', jsonStr);
//   },
//   { deep: true, immediate: true }
// );

//  const newValue = computed({
//   get: () => props.value,
//   set: (nv) => {
//     console.log('newValue set:', nv);
//     let jsonStr:any = ''
//     try {
//       jsonStr = JSON.stringify(nv);
//     } catch (error) {
//       console.error('Error converting fileList to JSON:', error);
//     }
//     emit('update:value', jsonStr)
//   }
// })
// 同步 modelValue -> fileList
watch(
  () => modelValue.value,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      fileList.value = [...newVal];
    }
  },
  { immediate: true, deep: true }
);

// 同步 fileList -> modelValue
watch(
  () => fileList.value,
  (newVal) => {
    console.log(modelValue.value, newVal);
   // 避免循环更新，只在值真正变化时才更新
    if (JSON.stringify(modelValue.value) !== JSON.stringify(newVal)) {
      modelValue.value = [...newVal];
    }
    // 保留 change 事件，确保向后兼容
    emit('change', unref(newVal));
  },
  { deep: true }
);
// 初始化
onMounted(() => {
  if (modelValue && modelValue.length > 0) {
    fileList.value = modelValue.value;
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
        const fileData = response.result || '';
        
        // 构建文件项
        const newFile: FileItem = {
          uid: file.uid,
          fileName: file.name,
          fileSize: file.size,
          fileKey: fileData,
          fileTagType: 2, // 默认处置过程
          districtFileTagType: isAudioFile(file) ? 2 : '', // 录音类型默认选择
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
  // emit('update:value', fileList.value);
  // emit('change', fileList.value);
  // emit('update:modelValue', fileList.value);
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
  emit('delete', file);
};

// 文件预览
const handlePreview = (file) => {
  previewFile.value = file;
  
  // 在实际应用中，这里应该是通过fileKey获取真实的预览URL
  if (file.fileKey) {
    if(file.fileKey.indexOf('app-data/tmp/') > -1) {
      // 处理临时文件路径
      previewUrl.value = `/citizen-voice/sys/common/static/${file.fileKey.replace('/citizen-voice/', '')}`;
    } else {
      previewUrl.value = `/citizen-voice/sys/common/static/${file.fileKey}`;
    }
   
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
  let downloadUrl = '';
  if(file.fileKey.indexOf('app-data/tmp/') > -1) {
    // 处理临时文件路径
    downloadUrl = `/citizen-voice/sys/common/static/${file.fileKey.replace('/citizen-voice/', '')}`;
  } else {
    downloadUrl = `/citizen-voice/sys/common/static/${file.fileKey}`;
  }
  // 模拟文件下载，实际应该调用API
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

function handleUploadFromList() {
   if (props.readOnly) {
    createMessage.warning('当前为只读模式，不能上传文件');
    return;
  }
  // 选择文件逻辑
  replyFileListModalVisible.value = true;
}

// 判断是否为图片文件
const isImageFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return imageTypes.includes(ext);
};

// 判断是否为PDF文件
const isPdfFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  return name.toLowerCase().endsWith('.pdf');
};
// 判断是否为音频文件
const isAudioFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return audioTypes.includes(ext);
};
// 判断是否为视频文件
const isVideoFile = (file) => {
  if (!file) return false;
  const name = file.fileName || file.name || '';
  const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
  return videoTypes.includes(ext);
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