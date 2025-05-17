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
       <!-- 书记/主任建议弹窗 -->
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
    import { ref, nextTick } from 'vue';
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
    // 创建消息实例
    const { createMessage } = useMessage();
    //注册 modal
    const [registerModal, { openModal }] = useModal();
    const [registerHistoryModal, { openModal:openHistoryModal }] = useModal();
    const [registerSuggestModal, { openModal:openSuggestModal, closeModal }] = useModal();

    // 建议表单schema
    const suggestSchemas: FormSchema[] = [  
      {
        field: 'id',
        label: 'ID',
        component: 'Input',
        ifShow: false,
      },
      {
        field: 'type',
        label: '类型',
        component: 'Input',
        ifShow: false,
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
            },
            actionColumn: {
              width: 220,
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

    // 注册建议表单
    const [registerSuggestForm, {validate, resetFields, setFieldsValue, clearValidate}] = useForm({
      labelWidth: 100,
      schemas: suggestSchemas,
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
    });

    //注册table数据
    const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
    
    function getTableAction(record): ActionItem[] {
      return [
        {
          label: '分派',
          onClick: handleEdit.bind(null, record),
          // ifShow: () => hasPermission('system:user:edit'),
        },
        {
          label: '书记建议',
          onClick: handleSuggest.bind(null, record, 'shuji'),
          // ifShow: () => hasPermission('system:user:edit'),
        },
        {
          label: '主任建议',
          onClick: handleSuggest.bind(null, record, 'zhuren'),
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
    // 表单数据引用
  const suggestFormRef = ref(null);
  const suggestLoading = ref(false);
  const suggestTitle = ref('');
  
  // 书记建议、主任建议
  async function handleSuggest(record: Recordable, type: string) {
    // 设置弹窗标题
    suggestTitle.value = type === 'shuji' ? '书记建议' : '主任建议';
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

    // 删除

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