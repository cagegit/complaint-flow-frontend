<template>
  <div class="complaint-management">
    <a-card class="search-card" title="搜索条件">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" layout="inline" :model="searchForm" @finish="handleSearch">
        <a-row :gutter="30">
          <a-col :span="6">
            <a-form-item label="案件编号" name="caseNumber">
              <a-input v-model:value="searchForm.caseNumber" placeholder="请输入案件编号" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="标题" name="title">
              <a-input v-model:value="searchForm.title" placeholder="请输入标题" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工单编号" name="workOrderNumber">
              <a-input v-model:value="searchForm.workOrderNumber" placeholder="请输入工单编号" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="接收状态" name="receiveStatus">
              <a-select v-model:value="searchForm.receiveStatus" placeholder="请选择接收状态" allowClear>
                <a-select-option :value="ReceiveStatus.RECEIVED">已接收</a-select-option>
                <a-select-option :value="ReceiveStatus.NO">未接收</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="数据来源" name="sourceType">
              <a-select v-model:value="searchForm.sourceType" placeholder="请选择数据来源" allowClear>
                <a-select-option :value="SourceType.GOVERNMENT">政府</a-select-option>
                <a-select-option :value="SourceType.MEDIA">媒体</a-select-option>
                <a-select-option :value="SourceType.PUBLIC">公众</a-select-option>
                <a-select-option :value="SourceType.OTHER">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="重点对象" name="monitorType">
              <a-select v-model:value="searchForm.monitorType" placeholder="请选择重点对象" allowClear>
                <a-select-option :value="MonitorType.IMPORTANT">重要</a-select-option>
                <a-select-option :value="MonitorType.NORMAL">普通</a-select-option>
                <a-select-option :value="MonitorType.LOW">低优先级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="导入时间" name="importTime">
              <a-range-picker v-model:value="dateRanges.importTime" @change="handleImportTimeChange" show-time format="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="派单时间" name="sendTime">
              <a-range-picker v-model:value="dateRanges.sendTime" @change="handleSendTimeChange" show-time format="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit">搜索</a-button>
                <a-button @click="resetSearch">重置</a-button>
                <a-button type="primary" @click="showAddModal">新增</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-card class="table-card" title="投诉列表">
      <a-table :dataSource="complaintList" :columns="columns" :pagination="pagination" :loading="loading" rowKey="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'receiveStatus'">
            {{ getReceiveStatusText(record.receiveStatus) }}
          </template>

          <template v-if="column.key === 'sourceType'">
            {{ getSourceTypeText(record.sourceType) }}
          </template>

          <template v-if="column.key === 'monitorType'">
            {{ getMonitorTypeText(record.monitorType) }}
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除这条投诉记录吗?" ok-text="是" cancel-text="否" @confirm="handleDelete(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑表单模态框 -->
    <a-modal :visible="modalVisible" :title="modalTitle" @cancel="closeModal" @ok="handleModalOk" width="700px">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="案件编号" name="caseNumber">
              <a-input v-model:value="formData.caseNumber" placeholder="请输入案件编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="标题" name="title" required>
              <a-input v-model:value="formData.title" placeholder="请输入标题" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="工单编号" name="workOrderNumber">
              <a-input v-model:value="formData.workOrderNumber" placeholder="请输入工单编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="接收状态" name="receiveStatus" required>
              <a-select v-model:value="formData.receiveStatus" placeholder="请选择接收状态">
                <a-select-option :value="ReceiveStatus.RECEIVED">线上</a-select-option>
                <a-select-option :value="ReceiveStatus.NO">线下</a-select-option>
                <a-select-option :value="ReceiveStatus.ALL">全部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据来源" name="sourceType" required>
              <a-select v-model:value="formData.sourceType" placeholder="请选择数据来源">
                <a-select-option :value="SourceType.GOVERNMENT">政府</a-select-option>
                <a-select-option :value="SourceType.MEDIA">媒体</a-select-option>
                <a-select-option :value="SourceType.PUBLIC">公众</a-select-option>
                <a-select-option :value="SourceType.OTHER">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="重点对象" name="monitorType" required>
              <a-select v-model:value="formData.monitorType" placeholder="请选择重点对象">
                <a-select-option :value="MonitorType.IMPORTANT">重要</a-select-option>
                <a-select-option :value="MonitorType.NORMAL">普通</a-select-option>
                <a-select-option :value="MonitorType.LOW">低优先级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="关键字" name="keywords">
          <a-input v-model:value="formData.keywords" placeholder="请输入关键字" />
        </a-form-item>
        <a-form-item label="主要内容" name="mainContent" required>
          <a-textarea v-model:value="formData.mainContent" placeholder="请输入主要内容" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts" name="ComplaintReceive">
  import { ref, reactive, computed, onMounted, toRaw } from 'vue';
  import { message } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import type { TablePaginationConfig } from 'ant-design-vue/es/table/interface';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import { getComplaintList, createComplaint, updateComplaint, deleteComplaint } from '@/api/complaint';
  import { ComplaintItem, QueryParams, PaginationConfig, ReceiveStatus, SourceType, MonitorType } from './types';

  // Data
  const complaintList = ref<ComplaintItem[]>([]);
  const loading = ref<boolean>(false);
  const modalVisible = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const currentId = ref<string>('');
  const formRef = ref();

  // Search form
  const searchForm = reactive<QueryParams>({
    pageNum: 1,
    pageSize: 10,
    receiveStatus: ReceiveStatus.RECEIVED,
    startImportTime: dayjs().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss'),
    endImportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  });

  // Date ranges for search
  const dateRanges = reactive({
    importTime: [] as Dayjs[],
    sendTime: [] as Dayjs[],
  });

  // Form data for add/edit
  const formData = reactive<Partial<ComplaintItem>>({
    caseNumber: '',
    title: '',
    mainContent: '',
    receiveStatus: ReceiveStatus.RECEIVED,
    sourceType: undefined,
    monitorType: undefined,
    keywords: '',
    workOrderNumber: '',
  });

  // Form validation rules
  const formRules: Record<string, Rule[]> = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    mainContent: [{ required: true, message: '请输入主要内容', trigger: 'blur' }],
    receiveStatus: [{ required: true, message: '请选择接收状态', trigger: 'change' }],
    sourceType: [{ required: true, message: '请选择数据来源', trigger: 'change' }],
    monitorType: [{ required: true, message: '请选择重点对象', trigger: 'change' }],
  };

  // Table pagination config
  const pagination = reactive<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // Table columns
  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '接收状态',
      dataIndex: 'receiveStatus',
      key: 'receiveStatus',
    },
    {
      title: '数据来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
    },
    {
      title: '重点对象',
      dataIndex: 'monitorType',
      key: 'monitorType',
    },
    {
      title: '工单编号',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
    },
    {
      title: '导入时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
    },
  ];

  // Computed modal title
  const modalTitle = computed(() => {
    return isEdit.value ? '编辑投诉' : '新增投诉';
  });

  // Fetch complaint list
  const fetchData = async () => {
    loading.value = true;
    try {
      const res: any = await getComplaintList(toRaw(searchForm));
      complaintList.value = res.list;
      pagination.total = res.total;
      pagination.current = res.pageNum;
      pagination.pageSize = res.pageSize;
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // Initialize data on component mount
  onMounted(() => {
    fetchData();
  });

  // Methods for search form
  const handleSearch = () => {
    searchForm.pageNum = 1;
    fetchData();
  };

  const resetSearch = () => {
    Object.keys(searchForm).forEach((key) => {
      if (key !== 'pageNum' && key !== 'pageSize') {
        searchForm[key as keyof QueryParams] = undefined;
      }
    });

    dateRanges.importTime = [];
    dateRanges.sendTime = [];
    searchForm.pageNum = 1;
    fetchData();
  };

  const handleImportTimeChange = (dates: Dayjs[], dateStrings: string[]) => {
    if (dates && dates.length === 2) {
      searchForm.startImportTime = dateStrings[0];
      searchForm.endImportTime = dateStrings[1];
    } else {
      searchForm.startImportTime = undefined;
      searchForm.endImportTime = undefined;
    }
  };

  const handleSendTimeChange = (dates: Dayjs[], dateStrings: string[]) => {
    if (dates && dates.length === 2) {
      searchForm.startSendTime = dateStrings[0];
      searchForm.endSendTime = dateStrings[1];
    } else {
      searchForm.startSendTime = undefined;
      searchForm.endSendTime = undefined;
    }
  };

  // Methods for table
  const handleTableChange = (pag: TablePaginationConfig) => {
    searchForm.pageNum = pag.current || 1;
    searchForm.pageSize = pag.pageSize || 10;
    fetchData();
  };

  // Methods for add/edit modal
  const showAddModal = () => {
    isEdit.value = false;

    // Reset form data
    Object.keys(formData).forEach((key) => {
      formData[key as keyof Partial<ComplaintItem>] = key === 'receiveStatus' || key === 'sourceType' || key === 'monitorType' ? undefined : '';
    });

    modalVisible.value = true;
  };

  const handleEdit = (record: ComplaintItem) => {
    isEdit.value = true;
    currentId.value = record.id;

    // Copy record values to formData
    Object.keys(formData).forEach((key) => {
      formData[key as keyof Partial<ComplaintItem>] = record[key as keyof ComplaintItem];
    });

    modalVisible.value = true;
  };

  const closeModal = () => {
    modalVisible.value = false;
  };

  const handleModalOk = async () => {
    try {
      await formRef.value.validate();

      if (isEdit.value) {
        await updateComplaint({
          ...toRaw(formData),
          id: currentId.value,
        });
        message.success('更新成功');
      } else {
        await createComplaint(toRaw(formData));
        message.success('添加成功');
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // Methods for delete
  const handleDelete = async (id: string) => {
    try {
      await deleteComplaint(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // Helper methods for display text
  const getReceiveStatusText = (type?: ReceiveStatus) => {
    switch (type) {
      case ReceiveStatus.RECEIVED:
        return '已接收';
      case ReceiveStatus.NO:
        return '未接收';
      default:
        return '-';
    }
  };

  const getSourceTypeText = (type?: SourceType) => {
    switch (type) {
      case SourceType.GOVERNMENT:
        return '政府';
      case SourceType.MEDIA:
        return '媒体';
      case SourceType.PUBLIC:
        return '公众';
      case SourceType.OTHER:
        return '其他';
      default:
        return '-';
    }
  };

  const getMonitorTypeText = (type?: MonitorType) => {
    switch (type) {
      case MonitorType.IMPORTANT:
        return '重要';
      case MonitorType.NORMAL:
        return '普通';
      case MonitorType.LOW:
        return '低优先级';
      default:
        return '-';
    }
  };
</script>

<style scoped>
  .complaint-management {
    padding: 20px;
  }
  .search-card {
    margin-bottom: 20px;
  }
  .table-card {
    margin-bottom: 20px;
  }
</style>
