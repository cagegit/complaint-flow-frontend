<template>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <!--插槽:table标题-->
          <template #tableTitle>
            <!-- <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button> -->
            <!-- <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')"> 导出</a-button> -->
            <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button> -->
            <!-- <a-button type="primary" @click="showEdit" preIcon="ant-design:edit-outlined">分派</a-button> -->
            <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleAssign">
                    <Icon icon="ant-design:send-outlined"></Icon>
                    批量分派
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
<script lang="ts" setup name="forward-complain">
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list } from './assign.api'
    import { columns, searchFormSchema } from './assign.data'
    import { useModal } from '/@/components/Modal';
    //@ts-ignore
    import TicketEdit from './TicketEdit.vue';
    //@ts-ignore
    import ContactHistory from '../components/ContactHistory/index.vue';
    //注册 modal
    const [registerModal, { openModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    // 列表页面公共参数、方法
    const { tableContext } = useListPage({
        designScope: 'ticket-list',
        tableProps: {
            title: '工单分派列表',
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
            return Object.assign(params, { pageNum:  params.pageNo });
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

    //注册table数据
    const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
    
    function getTableAction(record): ActionItem[] {
      return [
        {
          label: '分派',
          onClick: handleEdit.bind(null, record),
          // ifShow: () => hasPermission('system:user:edit'),
        }
      ];
    }

  function handleEdit(record: Recordable) {
    openModal(true, {
       record,
       isUpdate: true,
       showFooter: true,
    });
  }

//   async function handleDelete(record: Recordable) {

//     try {
//       await deleteTicket({ id: record.id });
//       reload();
//     } catch (error) {
//       console.error('删除失败', error);
//     }
//   }


    /**
     * 成功回调
     */
    function handleSuccess() {
    reload();
    }

    function showEdit(record:any) {
      handleEdit(record)
    }

    // 批量分派
    function batchHandleAssign() {
      openModal(true, {
        record: selectedRowKeys,
        isUpdate: true,
        showFooter: true,
      });
    }

    // 联系历史
    function showHistoryModal(type: string, record: Recordable) {
      openHistoryModal(true, {
        record: { timeType: type, ...record },
        isUpdate: true,
        showFooter: true
      });
    }
</script>