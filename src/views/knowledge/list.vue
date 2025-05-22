<template>
  <div class="knowledge-page">
    <div class="py-4">
      <a-button type="link" style="color: #0c3c3a" @click="goBack" preIcon="ant-design:arrow-left-outlined">返回知识库</a-button>
    </div>
    <BasicTable @register="registerTable" :columns="columns">
      <template #form-department="{ model, field }">
        <a-select show-search v-model:value="model[field]" :options="deptList" placeholder="请选择部门" allowClear />
      </template>
      <template #form-options="{ model, field }">
        <a-select show-search v-model:value="model[field]" :options="optionTextList" placeholder="请选择诉求事项" allowClear />
      </template>
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <!-- 插槽  -->
      <template #title="{ record, text }">
        <a-button type="link" @click="toDetailPage(record)">{{ text }}</a-button>
      </template>
    </BasicTable>
    <!-- 新增/编辑表单 -->
    <EditModal @register="registerFormModal" @success="reload" :deptList="deptList" :optionTextList="optionTextList" />
  </div>
</template>
<script lang="ts" setup>
  // import { onMounted } from 'vue';
  import { ActionItem, BasicTable, FormSchema } from '/@/components/Table/index';
  import { getPageList, getOptionTextList, getDeptList } from '/@/api/complaint/knowledge';
  import { columns, departmentConfig, keywordsConfig, optionsTextConfig } from './list.data';
  import { useListPage } from '/@/hooks/system/useListPage';
  //@ts-ignore
  import EditModal from './EditModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useRoute, useRouter } from 'vue-router';
  import { onMounted, ref } from 'vue';

  const [registerFormModal, { openModal }] = useModal();
  // 获取router query
  const route = useRoute();
  const router = useRouter();

  // 诉求事项选项
  const optionTextList = ref<any[]>([]);
  // 部门列表
  const deptList = ref<any[]>([]);
  // 搜索表单
  const newSearchFormSchema = ref<FormSchema[]>([
    { ...departmentConfig, componentProps: { options: [] } } as FormSchema,
    { ...optionsTextConfig, componentProps: { options: [] } } as FormSchema,
    { ...keywordsConfig } as FormSchema,
  ]);

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'knowledge-list',
    tableProps: {
      title: '知识库列表',
      api: getPageList,
      columns: columns,
      size: 'small',
      formConfig: {
        // labelWidth: 200,
        schemas: newSearchFormSchema.value,
        actionColOptions: {
          xs: 24,
          lg: 6,
          md: 6,
          xl: 6,
          style: {
            justifyContent: 'flex-end',
          },
        },
      },
      actionColumn: {
        width: 160,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        console.log(params);
        if (route.query.category) {
          params.category = route.query.category;
        }
        return Object.assign(params, { pageNum: params.pageNo });
      },
    },
  });

  //注册table数据
  const [registerTable, { reload }] = tableContext;

  const initDeptList = async () => {
    try {
      const res: any = await getDeptList();
      const newDeptList = res.map((item: any) => ({
        label: item,
        value: item,
      }));
      deptList.value = newDeptList;
    } catch (error) {
      console.error('Failed to get dept list:', error);
    }
  };

  // 初始化获取诉求事项选项
  const initOptionTextList = async () => {
    try {
      const res: any = await getOptionTextList();
      const newOptionTextList = res.map((item: string) => ({
        label: item,
        value: item,
      }));
      optionTextList.value = newOptionTextList;
      console.log('newSearchFormSchema', newSearchFormSchema.value);
    } catch (error) {
      console.error('Failed to get option text list:', error);
    }
  };

  // 初始化数据和加载API
  onMounted(async () => {
    // 加载下拉选项数据
    await Promise.all([initDeptList(), initOptionTextList()]);
    // 触发表单重置和数据重新加载
    reload();
  });

  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        onClick: handleDelete.bind(null, record),
      },
    ];
  }

  function handleEdit(record) {
    console.log('handleEdit', record);
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }
  function handleDelete(record) {
    console.log('handleDelete', record);
    // router.push({ name: 'knowledge-delete', params: { id: record.id } });
  }

  function handleCreate() {
    console.log('handleCreate');
    openModal(true, {
      record: {},
      isUpdate: false,
      showFooter: true,
    });
  }
  function goBack() {
    console.log('goBack');
    // router.push({ path: '/knowledge/index' });
    router.back();
  }

  function toDetailPage(item: any) {
    console.log('toDetailPage', item);
    // router.push({ name: 'knowledge-detail', params: { id: item.id } });
    router.push({
      path: `/knowledge/detail`,
      query: { id: item.id || '1' },
    });
  }
</script>
<style lang="less" scoped>
  .knowledge-page {
    padding: 82px 20px 60px;
    // min-height: 100vh;
    // padding-top: 82px;
    max-width: 1280px;
    margin: 0 auto;
  }
  .knowledge-page h3 {
    // margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    padding: 20px 0;
  }
  .knowledge-page :deep(.ant-btn-primary) {
    background: #125c59;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
</style>
