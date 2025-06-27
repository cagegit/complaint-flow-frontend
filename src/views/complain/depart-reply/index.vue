<template>
    <!--引用表格-->
    <BasicTable @register="registerTable">
          <!--插槽:table标题-->
          <template #tableTitle>
            <!-- <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button> -->
            <!-- <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')"> 导出</a-button> -->
            <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入word</j-upload-button> -->
            <!-- <a-button type="primary" @click="showEdit" preIcon="ant-design:send-outlined">转出</a-button> -->
            <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
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
            </a-dropdown> -->
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
    import { h, ref } from 'vue';
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
    import { usePermission } from '/@/hooks/web/usePermission';
    import ApiCascader from '/@/components/Form/src/components/ApiCascader.vue';
    import { Input } from 'ant-design-vue';
    import { assignOther } from '../assign/assign.api';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { getAuthTree } from '../follow-up/follow-up.api';
import { is } from '/@/utils/is';

    const AInputTextArea = Input.TextArea;
    const route = useRoute();
    const [registerModal, { openModal }] = useModal();
    const { hasPermission } = usePermission();
    const [registerReplyModal, { openModal:openReplyModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    const { createMessage, createConfirm } = useMessage();
    // 列表页面公共参数、方法
    const { tableContext } = useListPage({
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
            width: 150,
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
       const [registerTable, { reload, getForm }] = tableContext;
       
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '回复',
            onClick: handleEdit.bind(null, record),
            ifShow: () => hasPermission('biz:complain:reply:save') || hasPermission('biz:complain:reply:submit'),
          },
          {
            label: '重新分派',
            onClick: handleTransfer.bind(null, record),
            ifShow: () => hasPermission('complain:assign:assignOther'),
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
      const orgId = ref<any>(null);
      const remark = ref<string>('');
      const isTransfer = ref<boolean>(false);
      // 重新分派
      async function handleTransfer(record: Recordable) {
        //重置
        orgId.value = '';
        remark.value = '';
        const fowardTitle = record.orgType == 2 ? '转出部门' : '转出管区';
        createConfirm({
          title: '是否重新分派选中的工单？',
          content: () => {
            // 使用 h 渲染函数创建 vnode
            return h('div', {style: {width: '100%'}}, [
              // h('p', '是否确认转出选中工单？'),
              h('p', fowardTitle +'：'),
              h(ApiCascader, {
                style: 'width: 100%;',
                placeholder: '请选择',  
                styles:{
                  width: '100%',
                },
                onChange: (val:any) => {
                  console.log('val', val);
                  orgId.value = val;
                },
                treeDataSimpleMode: true,
                api: async () => {
                  const res = await getAuthTree(record.orgType);
                  // console.log(res)
                  if (Array.isArray(res)) {
                    const newList = treeToList(res);
                    return newList.map(v => {
                      return {
                        id: v.id,
                        parentId: v.parentId,
                        label: v.departName,
                        value: v.id,
                      }
                    });
                  } else {
                    return [];
                  }
                },
              }),
              // 备注
              h('p',{style: { marginTop: ' 15px'}}, '备注：'),
              h(AInputTextArea, {
                style: 'width: 100%;',
                placeholder: '请输入备注',
                rows: 6,
                maxLength: 800,
                onChange: (e:any) => {
                  remark.value = e.target.value;
                },
              }), 
            ]);
          },
          iconType: 'warning',
          onOk: async () => {
            console.log(record);
            if (isTransfer.value) {
              // createMessage.warning('请勿重复操作');
              return Promise.reject('请勿重复操作');
            }
              // 添加类型参数
            if (orgId.value === '' || orgId.value === null || orgId.value === undefined) {
              createMessage.warning('请选择' + fowardTitle);
              return Promise.reject('未选择' + fowardTitle);
            }
            isTransfer.value = true;
            try {
              await assignOther({ 
                assignId: record.assignId,
                // 取列表最后一项
                orgId: (Array.isArray(orgId.value) && orgId.value.length > 0) ? orgId.value.pop() : orgId.value,
                remark: remark.value,
              });
              reload();
              createMessage.success('分派成功');
            } catch (error:any) {
              console.error('分派失败', error);
              createMessage.error(error?.message || '分派失败');
            } finally {
              isTransfer.value = false;
            } 
          },
          onCancel: () => {
            console.log('取消分派');
            isTransfer.value = false;
            // 重置 orgId 和 remark
            orgId.value = '';
            remark.value = '';
          },
        });
      
      }

      function treeToList(tree: any[]) {
        const list: any[] = [];
        function traverse(node) {
          list.push(node);
          if (node.children) {
            node.children.forEach(traverse);
          }
        }
        tree.forEach(traverse);
        return list;
      }
</script>