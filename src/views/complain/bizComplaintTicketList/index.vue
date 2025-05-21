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
    <!--插槽:表格内容-->
    <template #bodyCell="{ text, column, record }">
      <template v-if="column.dataIndex === 'caseNumber'">
        <a href="javascript:void(0)" @click="showEdit(record)">{{ text }}</a>
      </template>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
    <!-- 自定义slots -->
    <template #monthCount="{ record }">
      <a-button type="link" @click="showHistoryModal('1', record)">{{ record.monthCount }}</a-button>
    </template>
    <template #yearCount="{ record }">
      <a-button type="link" @click="showHistoryModal('2', record)">{{ record.yearCount }}</a-button>
    </template>
  </BasicTable>

  <!--工单编辑-->
  <TicketEdit @register="registerModal" @success="handleSuccess" />
  <!-- 联系历史 -->
  <ContactHistory @register="registerHistoryModal" />
</template>
<script lang="ts" setup>
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { list, deleteTicket, deleteBatchTicket } from './ticket.api';
import { columns, searchFormSchema } from './ticket.data';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
//@ts-ignore
import TicketEdit from './TicketEdit.vue';
//@ts-ignore
import ContactHistory from '../components/ContactHistory/index.vue';
//注册drawer
const [registerModal, { openModal }] = useModal();
const [registerHistoryModal, { openModal: openHistoryModal }] = useModal();
const { createConfirm } = useMessage();
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
      schemas: searchFormSchema,
    },
    actionColumn: {
      width: 120,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      console.log(params);
      return Object.assign(params, { pageNum: params.pageNo });
    },
  },
  // exportConfig: {
  //   name: '用户列表',
  //   url: getExportUrl,
  // },
  // importConfig: {
  //   url: getImportUrl,
  // },
});

//@ts-ignore 注册table数据
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
  openModal(true, {
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
  // 确认对话框
  createConfirm({
    title: '是否批量删除选中的数据？',
    content: '删除后数据将不可恢复',
    iconType: 'warning',
    onOk: async () => {
      try {
        await deleteBatchTicket({ ids: selectedRowKeys.value.join(',') });
        reload();
      } catch (error) {
        console.error('批量删除失败', error);
      }
    },
  });
  // confirm();
  console.log('批量删除', selectedRowKeys.value);
}

/**
 * 成功回调
 */
function handleSuccess() {
  reload();
}

function showEdit(record: Recordable) {
  handleEdit(record);
}
  function showHistoryModal(type: string, record: Recordable) {
      openHistoryModal(true, {
        record: { timeType: type, ...record },
        isUpdate: true,
        showFooter: true
      });
    }
</script>