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
              <!-- <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:send-outlined"></Icon>
                    批量转出
                  </a-menu-item>
                </a-menu>
              </template> -->
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
    import { onMounted } from 'vue';
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list } from './out.api'
    import { columns, searchFormSchema } from './out.data'
    import { useModal } from '/@/components/Modal';
    // import { useMessage } from '/@/hooks/web/useMessage';
    // import { Select, Input } from 'ant-design-vue';
    //@ts-ignore
    import TicketEdit from '../bizComplaintTicketList/TicketEdit.vue';
    //@ts-ignore
    import ContactHistory from '../components/ContactHistory/index.vue';
    const [registerModal, { openModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    // const { createMessage } = useMessage();


    onMounted(() => {
      // 获取退回类型字典
      // getDistrictDictByCode('back_type').then((res) => {
      //   console.log('res', res);
      //   backTypeDict.value = Array.isArray(res) ? res : [];
      // }).catch((err) => {
      //   console.error('获取退回类型字典失败', err);
      // });
    });
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
          // actionColumn: {
          //   width: 120,
          //   fixed: 'right',
          // },
          beforeFetch: (params) => {
            console.log(params);
            return Object.assign(params, { pageNum:  params.pageNo });
          },
          showIndexColumn: false,
          // 高亮状态为重点件的行
          rowClassName: (record:any) => {
            return record.labelCode == '11' ? 'highlight-table-row' : '';
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
    
      //@ts-ignore 注册table数据
      const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
       
      function getTableAction(record): ActionItem[] {
        return [
          // {
          //   label: '编辑',
          //   onClick: handleEdit.bind(null, record),
          //   // ifShow: () => hasPermission('system:user:edit'),
          // },
        ];
      }
    
      async function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          showFooter: true,
          inTurnOut: true
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
    
       
     function showEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          showFooter: false,
          inTurnOut: true
        });
      }

      function showHistoryModal(type: string, record: Recordable) {
        openHistoryModal(true, {
          record: { timeType: type, ...record },
          isUpdate: true,
          showFooter: true
        });
      }
    </script>