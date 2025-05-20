<template>
  <div class="knowledge-page">
    <div class="py-4">
      <a-button type="link" style="color: #0c3c3a" @click="goBack" preIcon="ant-design:arrow-left-outlined">返回知识库</a-button>
    </div>
    <BasicTable @register="registerTable" :columns="columns" >
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
     <EditModal @register="registerFormModal" @success="reload" />
  </div>
</template>
<script lang="ts" setup>
    // import { onMounted } from 'vue';
    import { ActionItem, BasicTable } from '/@/components/Table/index';
    import { getKnowledgeList as list } from './list.api';
    import { columns, searchFormSchema } from './list.data';
    import { useListPage } from '/@/hooks/system/useListPage';
    //@ts-ignore
    import EditModal from './EditModal.vue';
    import { useModal } from '/@/components/Modal';
    import { useRoute, useRouter } from 'vue-router';

    const [registerFormModal, { openModal }] = useModal();
    // 获取router query
    const route = useRoute();
    const router = useRouter();
    // 列表页面公共参数、方法
    const { tableContext } = useListPage({
        designScope: 'knowledge-list',
        tableProps: {
            title: '知识库列表',
            api: list,
            columns: columns,
            size: 'small',
            formConfig: {
                // labelWidth: 200,
                schemas: searchFormSchema,
                actionColOptions: {
                     xs: 24,
                     lg: 6,
                     md: 6,
                     xl: 6,
                     style: {
                        justifyContent: 'flex-end',
                     }
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
                return Object.assign(params, { pageNum:  params.pageNo});
            },
        },
    });

    //注册table数据
    const [registerTable, { reload }] = tableContext;
   
    function getTableAction(record): ActionItem[] {
      return [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
          // ifShow: () => hasPermission('system:user:edit'),
        },
        {
          label: '删除',
          onClick: handleDelete.bind(null, record),
          // ifShow: () => hasPermission('system:user:edit'),
        }
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
         openModal(true,{
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
    router.push(
      {
        path: `/knowledge/detail`,
        query: { id: item.id || '1' }
      }
    );
  };
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
    padding:  20px 0;
  }
  .knowledge-page  :deep(.ant-btn-primary) {
    background: #125c59;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
</style>