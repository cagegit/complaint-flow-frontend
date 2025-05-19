<template>
  <!--引用表格-->
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button> -->
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportTicketWords"> 导出word工单</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportKickOut"> 导出剔除统计表</a-button>
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
  </BasicTable>

  <!--工单编辑-->
  <ManagerEdit @register="registerModal" @success="handleSuccess" />
</template>
<script lang="ts" setup>
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { list, deleteTicket, deleteBatchTicket, exportTicketWord, exportKickOut } from './manager.api';
import { columns, searchFormSchema } from './manager.data';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
//@ts-ignore
import ManagerEdit from './ManagerEdit.vue';
import { usePermission } from '/@/hooks/web/usePermission';
import { getExportUrl } from '../../system/dict/dict.api';
import { downloadByUrl } from '/@/utils/file/download';

//注册modal
const [registerModal, { openModal }] = useModal();

const { createMessage, createConfirm } = useMessage();
const { isDisabledAuth } = usePermission();

// 列表页面公共参数、方法
const { prefixCls, tableContext, onImportXls } = useListPage({
  designScope: 'ticket-manager',
  tableProps: {
    title: '工单管理列表',
    api: list,
    columns: columns,
    size: 'small',
    formConfig: {
      labelCol: { span: 6 }, // 标签占 6 栅格
      wrapperCol: { span: 18 },
      schemas: searchFormSchema,
      // labelWidth: 200,
      // rowProps: {
      //   gutter: 24,
      // },
      // 是否开启高级搜索模式
      // showAdvancedButton: true,
      // // 折叠状态下显示的行数
      // showAdvancedNum: 6,
      // // 每行的列数
      // // fieldMapToNumber: 3,
      // // 是否显示所有表单项，默认为false
      // showAllSchema: false,
      // // 折叠时隐藏超出的表单项
      // autoFoldRows: true,
      // // 新增如下配置
      // actionColOptions: {
      //   span: 24,
      //   style: { textAlign: 'left' }, // 可选，按钮靠左
      // },
    },
    actionColumn: {
      width: 120,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      return Object.assign(params, { pageNum: params.pageNo });
    },
  },
});

//@ts-ignore 注册table数据
const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

function getTableAction(record): ActionItem[] {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
    },
    // {
    //   label: '删除',
    //   popConfirm: {
    //     title: '是否确认删除',
    //     confirm: handleDelete.bind(null, record),
    //   },
    // },
  ];
}

function handleCreate() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}

function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}

// async function handleDelete(record: Recordable) {
//   try {
//     await deleteTicket({ id: record.id });
//     reload();
//   } catch (error) {
//     console.error('删除失败', error);
//   }
// }

// function batchHandleDelete() {
//   if (!selectedRowKeys.value || selectedRowKeys.value.length === 0) {
//     return;
//   }

//   createConfirm({
//     title: '是否批量删除选中的数据？',
//     content: '删除后数据将不可恢复',
//     iconType: 'warning',
//     onOk: async () => {
//       try {
//         await deleteBatchTicket({ ids: selectedRowKeys.value.join(',') });
//         reload();
//       } catch (error) {
//         console.error('批量删除失败', error);
//       }
//     },
//   });
// }

/**
 * 成功回调
 */
function handleSuccess() {
  reload();
}

function showEdit(record: Recordable) {
  handleEdit(record);
}

/**
 *  导出word工单 */
function onExportTicketWords() {
  if (!selectedRowKeys.value || selectedRowKeys.value.length === 0) {
    createMessage.info(`请先选择要导出的数据！`);
    return;
  }
  exportTicketWord({ ids: selectedRowKeys.value.join(',') }).then((res) => {
    if (res) {
      handleDownload(res);
    }
  });
}
/**
 * 导出剔除统计表
 */
function onExportKickOut() {
  if (!selectedRowKeys.value || selectedRowKeys.value.length === 0) {
    createMessage.info(`请先选择要导出的数据！`);
    return;
  }
  exportKickOut({ ids: selectedRowKeys.value.join(',') }).then((res) => {
    if (res) {
      handleDownload(res);
    }
  });
}

// 下载
function handleDownload(res) {
  let url = '';
  let fileName = res.fileName;
  // 兼容新的上传接口
  if (url.indexOf('app-data/down/') > -1) {
    url = `/citizen-voice/sys/common/static/${res.fileKey}`;
  }
  downloadByUrl({ url, fileName });
}
</script>
<style scoped>
:deep(.ant-form-item-label > label) {
  line-height: 1.1;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 14px;
}
</style>
