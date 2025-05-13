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
    import { ref, h } from 'vue';
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list, forwardTicket, forwardTicketBatch } from './out.api'
    import { columns, searchFormSchema } from './out.data'
    import { useModal } from '/@/components/Modal';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { Select, Input } from 'ant-design-vue';
    //@ts-ignore
    import TicketEdit from '../bizComplaintTicketList/TicketEdit.vue';
    //@ts-ignore
    import ContactHistory from '../components/ContactHistory/index.vue';
    const [registerModal, { openModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    const { createMessage, createConfirm } = useMessage();
    const ASelect = Select;
    const AInput = Input;
    // 选择转出位置
    const forwardType = ref<string>('city');
    // 退回原因
    const forwardReason = ref<string>('');
    // 退回类型
    const backType = ref<string>('');
    // 退回单位
    const backOffice = ref<string>('');
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
            label: '转出',
            onClick: handleEdit.bind(null, record),
            // ifShow: () => hasPermission('system:user:edit'),
          },
        ];
      }
    
      async function handleEdit(record: Recordable) {
        createConfirm({
          title: '是否确认转出选中工单？',
          content: () => {
            // 使用 h 渲染函数创建 vnode
            return h('div', {}, [
              // h('p', '是否确认转出选中工单？'),
              h('p', '转出位置：'),
              h(ASelect, {
                style: 'width: 100%; margin-bottom: 15px;',
                value: forwardType.value,
                placeholder: '请选择',
                onChange: (val:any) => {
                  console.log('val', val);
                  forwardType.value = val;
                },
                options: [
                  { value: 'city', label: '转出到市' },
                  { value: 'district', label: '转出到区' },
                ],
              }),
              // 退回原因
              h('p', '退回原因：'),
              h(AInput, {
                style: 'width: 100%;',
                placeholder: '请输入退回原因',
                value: forwardReason.value,
                onInput: (e:any) => {
                  forwardReason.value = e.target.value;
                },
              }),
              ...forwardType.value === 'city' ? [
                h('p', '退回类型：'),
                h(ASelect, {
                  style: 'width: 100%; margin-bottom: 15px;',
                  value: backType.value,
                  placeholder: '请选择',
                  onChange: (val:any) => {
                    console.log('val', val);
                    backType.value = val;
                  },
                  options: [
                    { value: '1', label: 'a' },
                    { value: '2', label: 'b' },
                  ],
                }),
              ]: [],
               ...forwardType.value === 'district' ? [
                h('p', '退回单位：'),
                h(AInput, {
                  style: 'width: 100%; margin-bottom: 15px;',
                  value: backOffice.value,
                  placeholder: '请输入退回单位',
                  onInput: (e:any) => {
                    console.log('val', e.target.value);
                    backOffice.value = e.target.value;
                  }
                }),
              ]: [],
              //  选择city时展示，backType 退回类型
              // h(ASelect, {
              //   style: 'width: 100%; margin-bottom: 15px;',
              //   value: forwardType.value,
              //   placeholder: '请选择',
              //   onChange: (val:any) => {
              //     console.log('val', val);
              //     forwardType.value = val;
              //   },
              //   options: [
              //     { value: 'city', label: '转出到市' },
              //     { value: 'district', label: '转出到区' },
              //   ], 
            ]);
          },
          iconType: 'warning',
          onOk: async () => {
            console.log(record);
              // 添加类型参数
            if (!forwardType.value) {
              createMessage.warning('请选择转出位置');
              return Promise.reject('未选择转出位置');
            }
            if (!forwardReason.value) {
              createMessage.warning('请输入退回原因');
              return Promise.reject('未输入退回原因');
            }
            try {
              await forwardTicket({ 
                id: record.id,
                forwardType: forwardType.value,
                backReason: forwardReason.value || null,
                adviceOffice: backOffice.value || null,
                backType: backType.value || null
              });
              reload();
              createMessage.success('转出成功');
            } catch (error) {
              console.error('转出失败', error);
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
    
       
     function showEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          showFooter: true,
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