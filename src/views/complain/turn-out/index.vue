<template>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <!--插槽:table标题-->
          <template #tableTitle>
            <!-- <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button> -->
            <!-- <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')"> 导出</a-button> -->
            <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button> -->
            <!-- <a-button type="primary" @click="showEdit" preIcon="ant-design:send-outlined">转出</a-button> -->
            <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:send-outlined"></Icon>
                    批量转出
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
       <!-- <TicketEdit @register="registerDrawer" @success="handleSuccess" /> -->
    </template>
    <script lang="ts" setup name="forward-complain">
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list, forwardTicket, forwardTicketBatch } from './out.api'
    import { columns, searchFormSchema } from './out.data'

    import { useMessage } from '/@/hooks/web/useMessage';
    //@ts-ignore
    import TicketEdit from './TicketEdit.vue';
    //注册drawer
    const { createMessage, createConfirm } = useMessage();

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
            return Object.assign({ pageNum:  params.pageNo }, params);
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
            label: '转出',
            onClick: handleEdit.bind(null, record),
            // ifShow: () => hasPermission('system:user:edit'),
          },
        ];
      }
    
      async function handleEdit(record: Recordable) {
        createConfirm({
          title: '温馨提示',
          content: `是否确认转出选中工单？`,
          iconType: 'warning',
          onOk: () => async () => {
            try {
              await forwardTicket({ ids: record.id });
              reload();
              createMessage.success('转出成功');
            } catch (error) {
              console.error('删除失败', error);
              createMessage.error('转出失败');
            }
          },
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
        // handleEdit({id: 1})
      }
    </script>