<template>
  <!--引用表格-->
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button> -->
      <a-button type="primary" v-auth="'complain:manager:exportTicketWord'" preIcon="ant-design:export-outlined" @click="onExportTicketWords"> 导出word工单</a-button>
      <a-button type="primary" v-auth="'complain:manager:exportKickOut'" preIcon="ant-design:export-outlined" @click="onExportKickOut"> 导出剔除工单</a-button>
      <a-button type="primary" v-auth="'complain:manager:exportExcelStatis'" preIcon="ant-design:export-outlined" @click="onExportExcelStatis">导出Excel统计表</a-button>
      <a-button type="primary" v-auth="'complain:manager:exportDayExport'" preIcon="ant-design:export-outlined" @click="onExportDayExcel">导出日报表</a-button>
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

  <!--导出日报表-->
  <ExportDayExcel @register="registerExportDayModal" @success="handleSuccessExportDay" />

  <!--工单编辑-->
  <ManagerEdit @register="registerModal" @success="handleSuccess" />
</template>
<script lang="ts" setup>
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { list, exportTicketWord, exportKickOut, exportExcelStatis, getDayExcelColumns } from './manager.api';
import { columns, searchFormSchema } from './manager.data';
import { useModal, useModalInner } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';

//@ts-ignore
import ExportDayExcel from './ExportDay.vue';
//@ts-ignore
import ManagerEdit from './ManagerEdit.vue';
// import { usePermission } from '/@/hooks/web/usePermission';
// import { getExportUrl } from '../../system/dict/dict.api';
import { downloadByUrl } from '/@/utils/file/download';
import { ref, watch } from 'vue';
// import { JCheckbox } from '/@/components/Form';
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { usePermission } from '/@/hooks/web/usePermission';

//注册modal
const [registerModal, { openModal }] = useModal();
const [registerExportDayModal, { openModal: openExportModal }] = useModal();
// 当前路由
const route = useRoute();
const router = useRouter();
const { createMessage } = useMessage();
const { hasPermission } = usePermission();
// const { isDisabledAuth } = usePermission();
const columnNames = ref({});
const form = reactive({
  sex: '1',
  sport: '1,3',
});

const sportOptions = [
  {
    label: '足球',
    value: '1',
  },
  {
    label: '篮球',
    value: '2',
  },
  {
    label: '乒乓球',
    value: '3',
  },
];

// 列表页面公共参数、方法
const { tableContext } = useListPage({
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
      resetFunc: resetSearchList
    },
    actionColumn: {
      width: 120,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      console.log(params);
      const query=  route.query;
      // @ts-ignore
      const startTime = query?.startTime ? dayjs(query.startTime) : null;
      // @ts-ignore
      const endTime = query?.endTime ? dayjs(query.endTime) : null;
     if(query?.statusCode == '-1' && query?.resolveCount !== undefined) { // 二次办理statusCode + resolveCount
        getForm?.()?.setFieldsValue({
          statusCode: query.statusCode,
          resolveCount: query.resolveCount,
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime] } : {},
        });
        return Object.assign(params, { 
          pageNum: params.pageNo, 
          statusCode: query.statusCode, 
          resolveCount: query.resolveCount,
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime].join(',') } : {}, 
        });
      } else if(query?.statusCode == 'complete_done') {
        // 诉件统计
        getForm?.()?.setFieldsValue({
          statusCode: query.statusCode ? query.statusCode +'' : null,
          sourceType: query.sourceType ? query.sourceType +'' : null, // 来源类型
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime] } : {},
          caseType: query.caseType  || null, // 案件类型
          caseNature: query.caseNature || null, // 案件性质
          satisfyFlag: query.satisfyFlag || null, // 是否满意
          resolveFlag: query.resolveFlag || null, // 是否解决
        });
        return Object.assign(params, { 
          pageNum: params.pageNo, 
          statusCode: query.statusCode ? query.statusCode +'' : null,
          sourceType: query.sourceType ? query.sourceType +'' : null, // 来源类型
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime].join(',') } : {},
          caseType: query.caseType  || null,//案件类型
          caseNature: query.caseNature || null, //案件性质
          satisfyFlag: query.satisfyFlag || null, // 是否满意
          resolveFlag: query.resolveFlag || null, // 是否解决
        });
      } else if(query?.statusCode !== undefined) {
        getForm?.()?.setFieldsValue({
          statusCode: query.statusCode,
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime] } : {},
        });
        return Object.assign(params, { 
          pageNum: params.pageNo, 
          statusCode: query.statusCode,
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime].join(',') } : {},
         });
      } else if(query?.caseNature && query?.startTime && query?.endTime) {
        // console.log('query', query);
        getForm?.()?.setFieldsValue({
          caseNature: query.caseNature || null, // 案件性质
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime] } : {},
        });
        return Object.assign(params, { 
          pageNum: params.pageNo, 
          caseNature: query.caseNature || null, // 案件性质
         ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime].join(',') } : {},
        });
      } else if(query?.startTime && query?.endTime) {
        // console.log('query', query);
        getForm?.()?.setFieldsValue({
          ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime] } : {},
        });
        return Object.assign(params, { 
          pageNum: params.pageNo, 
         ...(query.startTime && query.endTime) ? { importTime: [startTime, endTime].join(',') } : {},
        });
      } else {
        return Object.assign(params, { pageNum: params.pageNo });
      }
    },
    // 高亮状态为重点件的行
    rowClassName: (record:any) => {
      return record.labelCode == '11' ? 'highlight-table-row' : '';
    }
  },
});

//@ts-ignore 注册table数据
const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

// 重置表单
async function resetSearchList() {
  if(route.query) {
    router.replace({ path: route.path });
  } else {
   // console.log('重置表单');
    getForm?.()?.resetFields();

    reload?.();
  }
 
}

function getTableAction(record): ActionItem[] {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      ifShow: () => hasPermission('complain:manager:edit'),
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
// 监听路由变化
// watch(
//   () => route.query,
//   async (newQuery, oldQuery) => {
//     // 当路由参数变化时，重新加载数据
//     console.log('路由参数变化', newQuery, oldQuery);
//     if (newQuery) {
//       // reload();
//       if(newQuery?.statusCode !== undefined) {
//         // console.log(getForm);
//         // await getForm?.()?.setFieldsValue({
//         //   statusCode: newQuery.statusCode +'',
//         // });
//         // console.log('res', getForm?.()?.getFieldsValue());
//         reload?.({
//           searchInfo: {
//             statusCode: newQuery.statusCode + '',
//           },
//         });
//       }
//     }
//   },
//   { immediate: true } // 初始加载时也执行一次
// );
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

/**
 * 导出Excel统计表
 */
async function onExportExcelStatis() {
  const paramsForm = await getForm().validate();
  // console.log('paramsForm', paramsForm);
  exportExcelStatis({ ...paramsForm, ids: selectedRowKeys.value.join(',') }).then((res) => {
    if (res) {
      // console.log('res', res);
      handleDownload(res);
    }
  });
}
/**
 * 导出日报表
 */
async function onExportDayExcel() {
  const columns = await getDayExcelColumns();
  // console.log('columns', columns.allColumns);
  // 将字符串转换为数组
  const aArray = columns.allColumns.split(',');
  const bArray = columns.userColumns.split(',');

  // 按照b的顺序过滤出a中存在的字段，并保留原始顺序
  const orderedPart = bArray.filter((item) => aArray.includes(item));

  // 获取a中存在但b中不存在的字段，并保留原始顺序
  const remainingPart = aArray.filter((item) => !bArray.includes(item));

  // 合并两部分
  const resultArray = [...orderedPart, ...remainingPart];
  const allColumns = resultArray.map((item) => ({
    value: item,
    label: item,
    selected: bArray.includes(item), // 判断是否在b中存在
  }));
  const paramsForm = await getForm().validate();
  const ids = selectedRowKeys.value.join(',');
  const params = {
    ...paramsForm,
    ids,
  };
  openExportModal(true, {
    showFooterExport: true,
    allColumns,
    params,
  });
}

// 下载
function handleDownload(res) {
  let url = res?.fileKey;
  let fileName = res.fileName;
  // 兼容新的上传接口
  if (url.indexOf('app-data/tmp/download/') > -1) {
    url = `/citizen-voice/sys/common/static/${res.fileKey}`;
  }
  downloadByUrl({ url, fileName });
}

function handleSuccessExportDay() {
  console.log('导出日报表成功');
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
