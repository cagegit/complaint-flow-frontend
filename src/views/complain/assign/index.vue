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
                  <a-menu-item key="1" v-auth="'complain:assign:add'" @click="batchHandleAssign">
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
        <!--工单分派-->
       <TicketEdit @register="registerModal" @success="handleSuccess" />
        <!-- 工单编辑 -->
       <TicketEditForm @register="registerEditModal" @success="handleSuccess" />
       <!-- 联系历史 -->
       <ContactHistory @register="registerHistoryModal" />
       <!-- 转出工单弹窗 -->
       <ForwardForm @register="registerForwardModal" @success="handleSuccess" />
       <!-- 书记/主任批示弹窗 -->
      <BasicModal
        v-bind="$attrs"
        @register="registerSuggestModal"
        :title="suggestTitle"
        :maskClosable="false"
        :width="500"
        @ok="handleSubmitSuggest"
        :confirmLoading="suggestLoading"
        destroyOnClose
      >
        <BasicForm 
          @register="registerSuggestForm" 
          ref="suggestFormRef"
        />
      </BasicModal>
    </template>
<script lang="ts" setup name="forward-complain">
    import { ref, nextTick, onMounted } from 'vue';
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { list, shujiSuggest, zhurenSuggest } from './assign.api'
    import { columns, searchFormSchema } from './assign.data'
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { BasicModal, useModal } from '/@/components/Modal';
    import { FormSchema } from '/@/components/Form';
    //@ts-ignore
    import TicketEdit from './TicketEdit.vue';
    //@ts-ignore
    import ContactHistory from '../components/ContactHistory/index.vue';
    import { useMessage } from '/@/hooks/web/useMessage';
    import { usePermission } from '/@/hooks/web/usePermission';
    // import { Select, Input } from 'ant-design-vue';
    import { getDistrictDictByCode } from '/@/api/common/api';
    //@ts-ignore
    import TicketEditForm from '../bizComplaintTicketList/TicketEdit.vue';
    //@ts-ignore
    import ForwardForm from './ForwardForm.vue';
    import { useRoute, useRouter } from 'vue-router';
    import dayjs from 'dayjs';

    const route = useRoute();
    const router = useRouter();
    // 创建消息实例
    const { createMessage } = useMessage();
    //注册 modal
    const [registerModal, { openModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    const [registerSuggestModal, { openModal:openSuggestModal, closeModal }] = useModal();
    const [registerEditModal, { openModal:openEditModal }] = useModal();
    const [registerForwardModal, { openModal:openForwardModal }] = useModal();
    const { hasPermission } = usePermission();
    // const ASelect = Select;
    // const AInput = Input;
    // const AInputTextArea = Input.TextArea;
    // 选择转出位置
    const forwardType = ref<string|undefined>('city');
    // 退回原因
    const forwardReason = ref<string|undefined>(undefined);
    // 退回类型
    const backType = ref<string|undefined>(undefined);
    // 退回类型字典
    const backTypeDict = ref<any[]>([]);
    // 退回单位
    const backOffice = ref<string|undefined>(undefined);
    // 建议表单schema
    const suggestSchemas: FormSchema[] = [  
      {
        field: 'id',
        label: 'ID',
        component: 'Input',
        show: false,
      },
      {
        field: 'type',
        label: '类型',
        component: 'Input',
        show: false,
      },
      {
        field: 'suggestionContent',
        component: 'InputTextArea',
        label: '建议内容',
        componentProps: {
          placeholder: '请输入建议内容',
          rows: 6,
          maxlength: 500,
          showCount: true,
        },
        rules: [
          { required: true, message: '请输入建议内容' },
        ],
      }
    ];
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
              resetFunc: async () => {
                if(route?.query) {
                  router.replace({ path: route.path });
                } else {
                  await getForm?.()?.resetFields?.();
                  reload?.();
                }
              }
            },
            actionColumn: {
              width: 180,
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

    // 注册建议表单
    const [registerSuggestForm, {validate, resetFields, setFieldsValue, clearValidate}] = useForm({
      labelWidth: 100,
      schemas: suggestSchemas,
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
    });

    //注册table数据
    const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
    
    function getTableAction(record): ActionItem[] {
      return [
         {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => hasPermission('complain:biz_complaint_ticket:edit'),
          },
        {
          label: '转出',
          onClick: handleTransfer.bind(null, record),
          ifShow: () => hasPermission('complain:biz_complaint_ticket:turnOut'),
        },
         {
          label: '分派',
          onClick: handleAssign.bind(null, record),
          ifShow: () => hasPermission('complain:assign:add'),
        },
        // {
        //   label: '书记批示',
        //   onClick: handleSuggest.bind(null, record, 'shuji'),
        //   // ifShow: () => hasPermission('complain:assign:shuji_suggest'),
        // },
        // {
        //   label: '主任批示',
        //   onClick: handleSuggest.bind(null, record, 'zhuren'),
        //   // ifShow: () => hasPermission('complain:assign:zhuren_suggest'),
        // }
      ];
    }

  onMounted(() => {
    // 获取退回类型字典
    getDistrictDictByCode('back_type').then((res) => {
      console.log('res', res);
      backTypeDict.value = Array.isArray(res) ? res : [];
    }).catch((err) => {
      console.error('获取退回类型字典失败', err);
    });
  });
  function handleAssign(record: Recordable) {
    openModal(true, {
       record,
       isUpdate: true,
       showFooter: true,
    });
  }

  function handleEdit(record: Recordable) {
    openEditModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      inTurnOut: true
    });
  }
    // 表单数据引用
  const suggestFormRef = ref(null);
  const suggestLoading = ref(false);
  const suggestTitle = ref('');
  
  // 书记批示、主任批示
  async function handleSuggest(record: Recordable, type: string) {
    // 设置弹窗标题
    suggestTitle.value = type === 'shuji' ? '书记批示' : '主任批示';
    console.log(record);
    resetFields();
     await nextTick();
      // 打开弹窗，传递必要参数
      openSuggestModal(true, {
        record: null,
        showFooter: true
      });
      await nextTick();
      // 设置表单值
      setFieldsValue({
        id: record.id,
        type,
        suggestionContent: null
      });
      clearValidate();
     
  }
  
  // 提交建议表单
  async function handleSubmitSuggest() {
    try {
      suggestLoading.value = true;
      // 校验表单
      const values = await validate();
      const { id, suggestionContent, type } = values;
      console.log(values);
      // 根据类型调用不同的保存接口
      if (type === 'shuji') {
        await shujiSuggest({
          complaintId: id,
          suggest: suggestionContent
        });
      } else {
        await zhurenSuggest({
          complaintId: id,
          suggest: suggestionContent
        });
      }
      
      // 成功消息提示
      createMessage.success(`${type === 'shuji' ? '书记' : '主任'}建议保存成功`);
      
      // 关闭弹窗
      closeModal();
      
      // 刷新列表
      reload();
    } catch (error:any) {
      console.error('保存建议失败', error);
      createMessage.error(`保存失败: ${error?.message || '未知错误'}`);
    } finally {
      suggestLoading.value = false;
    }
  }

  // 转出工单
  async function handleTransfer(record: Recordable) {
      openForwardModal(true, {
        record,
        isUpdate: true,
        showFooter: true,
      });
  }
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