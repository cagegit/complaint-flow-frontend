<template>
<!--引用表格-->
<BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <!-- <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button> -->
        <!-- <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')"> 导出</a-button> -->
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button>
        <!-- <a-button type="primary" @click="showEdit" preIcon="ant-design:hdd-outlined">编辑</a-button> -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                批量删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>

    <!--工单编辑-->
   <TicketEdit @register="registerDrawer" @success="handleSuccess" />
</template>
<script lang="ts" setup>
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { list, deleteTicket } from './ticket.api'
import { columns, searchFormSchema } from './ticket.data'
import { useDrawer } from '/@/components/Drawer';
//@ts-ignore
import TicketEdit from './TicketEdit.vue';
//注册drawer
const [registerDrawer, { openDrawer }] = useDrawer();
// 列表页面公共参数、方法
const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'ticket-list',
    tableProps: {
      title: '工单接收列表',
      api: list,
      columns: columns,
      size: 'small',
      formConfig: {
        // labelWidth: 200,
        schemas: searchFormSchema
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        console.log(params);
        return Object.assign({ pageNum:  params.pageNo }, params);
      }
    },
    // exportConfig: {
    //   name: '用户列表',
    //   url: getExportUrl,
    // },
    // importConfig: {
    //   url: getImportUrl,
    // },
  });

  //注册table数据
   const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
   
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        // ifShow: () => hasPermission('system:user:edit'),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  function handleEdit(record: Recordable) {
    openDrawer(true, {
       record,
       isUpdate: true,
       showFooter: true,
    });
  }

  async function handleDelete(record: Recordable) {

    try {
      await deleteTicket({ id: record.id });
      reload();
    } catch (error) {
      console.error('删除失败', error);
    }
  }

  function batchHandleDelete() {
        // deleteUser({ ids: selectedRowKeys }).then(() => {
        //   reload();
        // });
    }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }

  function showEdit() {
    handleEdit({id: 1})
  }
</script>