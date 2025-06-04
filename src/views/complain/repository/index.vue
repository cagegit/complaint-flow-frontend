<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">知识库管理</h1>
    </div>

    <!-- 顶部搜索框 -->
    <div class="mb-6 flex items-center">
      <div class="w-full relative">
        <input
          v-model="searchKeyword"
          type="text"
          class="w-full h-12 pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="搜索文件或文件夹..."
          @keyup.enter="handleSearch"
        />
        <span class="absolute left-4 top-3.5 text-gray-400">
          <SearchOutlined class="text-lg" />
        </span>
      </div>
      <a-button
        type="primary"
        class="ml-4 h-12 flex items-center"
        @click="handleSearch"
      >
        <span>搜索</span>
      </a-button>
    </div>

    <!-- 操作工具栏 -->
    <div class="flex justify-between mb-4">
      <div class="flex space-x-2">
        <!-- 上传下拉按钮 -->
        <a-dropdown>
          <a-button type="primary" class="flex items-center">
            <UploadOutlined />
            <span class="ml-1">上传</span>
            <DownOutlined class="ml-1" />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="uploadFile">
                <FolderAddOutlined class="mr-1" /> 上传文件
              </a-menu-item>
              <a-menu-item key="2" @click="uploadFolder">
                <FolderAddOutlined class="mr-1" /> 上传文件夹
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- 其他操作按钮 -->
        <a-button 
          @click="createFolder" 
          class="flex items-center"
        >
          <FolderAddOutlined />
          <span class="ml-1">新建文件夹</span>
        </a-button>

        <a-button 
          @click="refreshList" 
          class="flex items-center"
        >
          <ReloadOutlined />
          <span class="ml-1">刷新</span>
        </a-button>
      </div>

      <!-- 视图切换按钮 -->
      <div class="flex items-center space-x-2">
        <a-radio-group v-model:value="viewType" button-style="solid">
          <a-radio-button value="list">
            <UnorderedListOutlined />
          </a-radio-button>
          <a-radio-button value="grid">
            <AppstoreOutlined />
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div class="mb-4 flex items-center text-sm">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <a href="javascript:;" @click="navigateToRoot">知识库</a>
        </a-breadcrumb-item>
        <template v-for="(item, index) in breadcrumbPaths" :key="index">
          <a-breadcrumb-item>
            <a href="javascript:;" @click="navigateToPath(index)">{{ item.name }}</a>
          </a-breadcrumb-item>
        </template>
      </a-breadcrumb>
    </div>

    <!-- 列表模式 -->
    <div v-if="viewType === 'list'" class="bg-white rounded-lg shadow">
      <BasicTable
        :columns="columns"
        :dataSource="repositoryList"
        :rowKey="(record) => record.id"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 文件/文件夹名称列 -->
          <template v-if="column.dataIndex === 'name'">
            <div class="flex items-center">
              <FolderOutlined v-if="record.type === 'folder'" class="mr-2 text-yellow-500 text-lg" />
              <FileOutlined v-else class="mr-2 text-gray-500 text-lg" />
              <a 
                href="javascript:;" 
                class="hover:text-blue-500"
                @click="handleItemClick(record)"
              >
                {{ record.name }}
              </a>
            </div>
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'action'">
            <div class="flex space-x-2">
              <a-button 
                v-if="record.type !== 'folder'" 
                type="link" 
                size="small"
                @click="handleDownload(record)"
              >
                <DownloadOutlined />
                下载
              </a-button>
              
              <a-button 
                v-if="record.type !== 'folder'" 
                type="link" 
                size="small"
                @click="handlePreview(record)"
              >
                <EyeOutlined />
                预览
              </a-button>
              
              <a-button 
                type="link" 
                size="small"
                danger
                @click="handleDelete(record)"
              >
                <DeleteOutlined />
                删除
              </a-button>
            </div>
          </template>
        </template>
      </BasicTable>
    </div>

    <!-- 网格模式 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div 
        v-for="item in repositoryList" 
        :key="item.id"
        class="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow duration-200 relative group"
        @click="handleItemClick(item)"
      >
        <!-- 文件图标 -->
        <div class="w-16 h-16 flex items-center justify-center mb-2">
          <FolderFilled v-if="item.type === 'folder'" class="text-yellow-500 text-4xl" />
          <FileFilled v-else-if="item.type === 'pdf'" class="text-red-500 text-4xl" />
          <FileWordFilled v-else-if="item.type === 'docx' || item.type === 'doc'" class="text-blue-500 text-4xl" />
          <FileExcelFilled v-else-if="item.type === 'xlsx' || item.type === 'xls'" class="text-green-500 text-4xl" />
          <FilePptFilled v-else-if="item.type === 'pptx' || item.type === 'ppt'" class="text-orange-500 text-4xl" />
          <FileImageFilled v-else-if="['jpg', 'png', 'gif', 'jpeg'].includes(item.type)" class="text-purple-500 text-4xl" />
          <FileFilled v-else class="text-gray-500 text-4xl" />
        </div>

        <!-- 文件名 -->
        <div class="text-center w-full">
          <div class="truncate text-sm font-medium">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.uploadTime }}</div>
        </div>

        <!-- 悬浮操作按钮 -->
        <div class="absolute top-2 right-2 hidden group-hover:flex space-x-1">
          <a-button 
            v-if="item.type !== 'folder'" 
            type="text" 
            size="small"
            @click.stop="handleDownload(item)"
          >
            <DownloadOutlined />
          </a-button>
          
          <a-button 
            v-if="item.type !== 'folder'" 
            type="text" 
            size="small"
            @click.stop="handlePreview(item)"
          >
            <EyeOutlined />
          </a-button>
          
          <a-button 
            type="text" 
            size="small"
            danger
            @click.stop="handleDelete(item)"
          >
            <DeleteOutlined />
          </a-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="viewType === 'grid'" class="mt-6 flex justify-center">
      <a-pagination
        v-model:current="pagination.current"
        :total="pagination.total"
        :pageSize="pagination.pageSize"
        @change="handlePaginationChange"
        show-size-changer
        show-quick-jumper
      />
    </div>

    <!-- 上传文件对话框 -->
    <a-modal
      v-model:visible="uploadModalVisible"
      :title="uploadType === 'file' ? '上传文件' : '上传文件夹'"
      @ok="handleUploadOk"
      @cancel="handleUploadCancel"
    >
      <a-upload-dragger
        v-if="uploadType === 'file'"
        :multiple="true"
        :file-list="fileList"
        :before-upload="beforeUpload"
        @change="handleUploadChange"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">
          支持单个或批量上传，严禁上传公司数据或其他违禁文件
        </p>
      </a-upload-dragger>

      <div v-else class="p-4 border border-dashed border-gray-300 rounded-lg text-center">
        <p>
          <FolderAddOutlined class="text-4xl text-gray-400" />
        </p>
        <p class="mt-2 text-gray-600">请选择要上传的文件夹</p>
        <a-button class="mt-2" @click="triggerFolderUpload">选择文件夹</a-button>
      </div>
    </a-modal>

    <!-- 预览对话框 -->
    <a-modal
      v-model:visible="previewModalVisible"
      :title="previewFileName"
      width="800px"
      :footer="null"
    >
      <div class="h-96 flex items-center justify-center bg-gray-100">
        <!-- 根据文件类型显示不同的预览内容 -->
        <div v-if="previewLoading" class="text-center">
          <a-spin />
          <div class="mt-2">加载中...</div>
        </div>
        <img
          v-else-if="isImageFile(previewFileType)"
          :src="previewUrl"
          class="max-w-full max-h-full object-contain"
        />
        <iframe
          v-else-if="previewFileType === 'pdf'"
          :src="previewUrl"
          class="w-full h-full"
        ></iframe>
        <div v-else class="text-center">
          <FileOutlined class="text-6xl text-gray-400" />
          <div class="mt-4">无法预览该文件类型，请下载后查看</div>
          <a-button type="primary" class="mt-4" @click="handleDownload(previewFile)">下载文件</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 新建文件夹对话框 -->
    <a-modal
      v-model:visible="folderModalVisible"
      title="新建文件夹"
      @ok="handleFolderOk"
      @cancel="handleFolderCancel"
    >
      <a-form :model="folderForm" :rules="folderRules">
        <a-form-item label="文件夹名称" name="name">
          <a-input v-model:value="folderForm.name" placeholder="请输入文件夹名称" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="folderForm.description" placeholder="请输入文件夹描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="repository">
  //ts语法
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { 
    SearchOutlined, 
    UploadOutlined, 
    DownOutlined,
    FolderAddOutlined, 
    ReloadOutlined,
    UnorderedListOutlined,
    AppstoreOutlined,
    FolderOutlined,
    FileOutlined,
    DownloadOutlined,
    EyeOutlined,
    DeleteOutlined,
    InboxOutlined,
    FolderFilled,
    FileFilled,
    FileWordFilled,
    FileExcelFilled,
    FilePptFilled,
    FileImageFilled
  } from '@ant-design/icons-vue';
import { imageTypes } from '/@/utils/fileType';
  
  // 消息实例
  const { createMessage, createConfirm } = useMessage();
  
  // 搜索关键词
  const searchKeyword = ref('');
  
  // 视图类型：列表或网格
  const viewType = ref('list');
  
  // 面包屑路径
  const breadcrumbPaths = ref<Array<{ id: string; name: string }>>([]);
  
  // 当前目录ID
  const currentFolderId = ref<string | null>(null);
  
  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      sorter: true,
    },
    {
      title: '上传日期',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: '20%',
      sorter: true,
    },
    {
      title: '上传人',
      dataIndex: 'uploadUser',
      key: 'uploadUser',
      width: '15%',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: '10%',
      customRender: ({ text, record }) => {
        if (record.type === 'folder') return '-';
        return formatSize(text);
      }
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '15%',
    },
  ];
  
  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  });
  
  // 示例知识库列表数据
  const repositoryList = ref([
    {
      id: '1',
      name: '项目文档',
      type: 'folder',
      uploadTime: '2025-05-12 10:30:22',
      uploadUser: '张三',
      size: 0,
    },
    {
      id: '2',
      name: '系统需求说明书.docx',
      type: 'docx',
      uploadTime: '2025-05-10 15:22:45',
      uploadUser: '李四',
      size: 2048576,
    },
    {
      id: '3',
      name: '功能测试报告.pdf',
      type: 'pdf',
      uploadTime: '2025-05-09 09:11:33',
      uploadUser: '王五',
      size: 4194304,
    },
    {
      id: '4',
      name: '产品架构图.png',
      type: 'png',
      uploadTime: '2025-05-08 16:45:12',
      uploadUser: '赵六',
      size: 1048576,
    },
    {
      id: '5',
      name: '项目进度表.xlsx',
      type: 'xlsx',
      uploadTime: '2025-05-07 11:22:33',
      uploadUser: '张三',
      size: 512000,
    },
  ]);
  
  // 上传相关变量
  const uploadModalVisible = ref(false);
  const uploadType = ref('file'); // 'file' 或 'folder'
  const fileList = ref([]);
  
  // 预览相关变量
  const previewModalVisible = ref(false);
  const previewFileName = ref('');
  const previewFileType = ref('');
  const previewUrl = ref('');
  const previewFile = ref(null);
  const previewLoading = ref(false);
  
  // 新建文件夹相关变量
  const folderModalVisible = ref(false);
  const folderForm = reactive({
    name: '',
    description: '',
  });
  const folderRules = {
    name: [
      { required: true, message: '请输入文件夹名称', trigger: 'blur' },
      { max: 50, message: '文件夹名称不能超过50个字符', trigger: 'blur' },
    ],
  };
  
  // 搜索方法
  const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
      createMessage.warning('请输入搜索关键词');
      return;
    }
    // TODO: 调用接口搜索文件
    createMessage.success(`正在搜索: ${searchKeyword.value}`);
    // 模拟搜索结果
    pagination.current = 1;
    // fetchRepositoryList();
  };
  
  // 表格变化事件处理
  const handleTableChange = (pag, filters, sorter) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    
    // TODO: 根据排序和分页参数请求数据
    // fetchRepositoryList({
    //   pageNum: pagination.current,
    //   pageSize: pagination.pageSize,
    //   sortField: sorter.field,
    //   sortOrder: sorter.order,
    // });
  };
  
  // 分页变化事件处理
  const handlePaginationChange = (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    // TODO: 根据分页参数请求数据
    // fetchRepositoryList();
  };
  
  // 处理文件/文件夹点击
  const handleItemClick = (record) => {
    if (record.type === 'folder') {
      // 处理文件夹点击，进入文件夹
      breadcrumbPaths.value.push({ id: record.id, name: record.name });
      currentFolderId.value = record.id;
      // fetchRepositoryList(record.id);
      createMessage.info(`进入文件夹: ${record.name}`);
    } else {
      // 处理文件点击，预览文件
      handlePreview(record);
    }
  };
  
  // 处理文件下载
  const handleDownload = (record) => {
    createMessage.success(`正在下载: ${record.name}`);
    // TODO: 实现文件下载逻辑
    // window.open(record.downloadUrl);
  };
  
  // 处理文件预览
  const handlePreview = (record) => {
    // 只有某些文件类型支持预览
    previewFileName.value = record.name;
    previewFileType.value = record.type;
    previewFile.value = record;
    previewLoading.value = true;
    previewModalVisible.value = true;
    
    // 模拟预览URL
    setTimeout(() => {
      previewLoading.value = false;
      // TODO: 实际环境中应该调用API获取预览URL
      previewUrl.value = '/preview-placeholder.jpg';
    }, 1000);
  };
  
  // 判断是否是图片文件
  const isImageFile = (type) => {
    return imageTypes.includes(type);
  };
  
  // 处理文件删除
  const handleDelete = (record) => {
    createConfirm({
      iconType: 'error',
      title: '确认删除',
      content: `确定要删除 ${record.name} 吗？此操作不可逆！`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // TODO: 调用删除接口
        createMessage.success(`已删除: ${record.name}`);
        // 从列表中删除
        repositoryList.value = repositoryList.value.filter(item => item.id !== record.id);
      },
    });
  };
  
  // 处理上传文件
  const uploadFile = () => {
    uploadType.value = 'file';
    uploadModalVisible.value = true;
    fileList.value = [];
  };
  
  // 处理上传文件夹
  const uploadFolder = () => {
    uploadType.value = 'folder';
    uploadModalVisible.value = true;
    fileList.value = [];
  };
  
  // 触发文件夹上传
  const triggerFolderUpload = () => {
    // 由于HTML标准限制，我们需要创建一个特殊的input元素来选择文件夹
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = (e:any) => {
      const files = e.target.files;
      if (files.length) {
        fileList.value = Array.from(files).map((file, index) => ({
          uid: `-${index}`,
          name: file.name,
          status: 'done',
          size: file.size,
          type: file.type,
          originFileObj: file,
        }));
      }
    };
    
    input.click();
  };
  
  // 上传前检查
  const beforeUpload = (file) => {
    // 可以在这里进行文件类型、大小等检查
    // 返回false会阻止上传
    return true;
  };
  
  // 处理上传状态变化
  const handleUploadChange = (info) => {
    fileList.value = info.fileList;
  };
  
  // 处理上传确认
  const handleUploadOk = () => {
    if (!fileList.value.length) {
      createMessage.warning('请选择文件');
      return;
    }
    
    // TODO: 实际上传逻辑
    createMessage.loading('正在上传...');
    
    // 模拟上传成功
    setTimeout(() => {
      createMessage.success('上传成功');
      uploadModalVisible.value = false;
      // 刷新列表
      refreshList();
    }, 1500);
  };
  
  // 处理上传取消
  const handleUploadCancel = () => {
    uploadModalVisible.value = false;
    fileList.value = [];
  };
  
  // 创建新文件夹
  const createFolder = () => {
    folderForm.name = '';
    folderForm.description = '';
    folderModalVisible.value = true;
  };
  
  // 处理新建文件夹确认
  const handleFolderOk = () => {
    if (!folderForm.name.trim()) {
      createMessage.warning('请输入文件夹名称');
      return;
    }
    
    // TODO: 调用创建文件夹API
    createMessage.success(`创建文件夹: ${folderForm.name}`);
    folderModalVisible.value = false;
    
    // 添加到列表
    repositoryList.value.unshift({
      id: Date.now().toString(),
      name: folderForm.name,
      type: 'folder',
      uploadTime: new Date().toLocaleString(),
      uploadUser: '当前用户',
      size: 0,
    });
  };
  
  // 处理新建文件夹取消
  const handleFolderCancel = () => {
    folderModalVisible.value = false;
  };
  
  // 刷新列表
  const refreshList = () => {
    createMessage.loading('正在刷新...');
    // TODO: 调用接口刷新列表
    setTimeout(() => {
      createMessage.success('刷新成功');
    }, 500);
  };
  
  // 导航到根目录
  const navigateToRoot = () => {
    breadcrumbPaths.value = [];
    currentFolderId.value = null;
    // fetchRepositoryList();
  };
  
  // 导航到指定路径
  const navigateToPath = (index) => {
    breadcrumbPaths.value = breadcrumbPaths.value.slice(0, index + 1);
    currentFolderId.value = breadcrumbPaths.value[index].id;
    // fetchRepositoryList(currentFolderId.value);
  };
  
  // 格式化文件大小
  const formatSize = (size) => {
    if (!size) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    
    return `${size.toFixed(2)} ${units[i]}`;
  };
  
  // 获取列表数据
  const fetchRepositoryList = (folderId = null) => {
    // TODO: 实现获取知识库列表的接口调用
    // const params = {
    //   keyword: searchKeyword.value,
    //   folderId: folderId || currentFolderId.value,
    //   pageNum: pagination.current,
    //   pageSize: pagination.pageSize,
    // };
    
    // 这里应该调用API
  };
  
  // 初始化加载数据
  // onMounted(() => {
  //   fetchRepositoryList();
  // });
</script>