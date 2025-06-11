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
        <TicketEdit @register="registerModal" @success="handleSuccess"  @qjForm="showQjForm"/>
        <!-- 预回复 -->
        <PreReplyForm @register="registerReplyModal" @success="handleReplySuccess" />
        <!-- 联系历史 -->
        <ContactHistory @register="registerHistoryModal" />
    </template>
    <script lang="ts" setup name="deaprt-reply">
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list} from './depart.api'
    import { columns, searchFormSchema } from './depart.data'
    import { useModal } from '/@/components/Modal';
    //@ts-ignore
    import PreReplyForm from '../components/PreReplyForm/index.vue';
      //@ts-ignore
    import ContactHistory from '../components/ContactHistory/index.vue';
    // import { useMessage } from '/@/hooks/web/useMessage';
    //@ts-ignore
    import TicketEdit from './TicketEditForm.vue';
    import { useRoute } from 'vue-router';
    import dayjs from 'dayjs';

    const route = useRoute();
    const [registerModal, { openModal }] = useModal();
    // const { createMessage, createConfirm } = useMessage();
    const [registerReplyModal, { openModal:openReplyModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    // 列表页面公共参数、方法
    const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
        designScope: 'ticket-list',
        tableProps: {
          title: '部门回复列表',
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
            if(route?.query) {
                let {startTime:q_startTime, endTime:q_endTime, ...rest} = route.query;
                  // @ts-ignore
                const startTime = q_startTime ? dayjs(q_startTime) : null;
                // @ts-ignore
                const endTime = q_endTime ? dayjs(q_endTime) : null;
                getForm?.()?.setFieldsValue?.({
                  ...rest,
                  ...(startTime&& endTime) ? {importTime: [startTime, endTime]} : {}
                });
                return Object.assign(params, { 
                  pageNum:  params.pageNo, 
                  ...rest,
                   ...(startTime&& endTime) ? {importTime: [startTime, endTime].join(',')} : {}
                 });
              } else {
                 return Object.assign(params, { pageNum:  params.pageNo });
              }
          },
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
    
      //注册table数据
       const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
       
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '回复',
            onClick: handleEdit.bind(null, record),
            // ifShow: () => hasPermission('system:user:edit'),
          },
          // {
          //   label: '预回复',
          //   onClick: handlePreReply.bind(null, record),
          //   // ifShow: () => hasPermission('system:user:edit'),
          // },
        ];
      }
    
      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          showFooter: true,
        });
      }

      //  function handlePreReply(record: Recordable) {
      //   openReplyModal(true, {
      //     record,
      //     isUpdate: false,
      //     showFooter: false,
      //   });
      // }
  
    
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
          showFooter: true,
        });
      }

      function handleReplySuccess() {
        reload();
      }

      function showHistoryModal(tp: string, record: Recordable) {
        openHistoryModal(true, {
          record: { timeType: tp, ...record },
          isUpdate: false,
          showFooter: false,
        });
      }
      // 预回复
      function showQjForm(data:any) {
        openReplyModal(true, {
          record: data.record,
          resolve: data.resolve,
          isUpdate: false,
          showFooter: false,
        });
      }
    </script>