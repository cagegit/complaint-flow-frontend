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
        </BasicTable>
    
        <!--工单编辑-->
        <TicketEdit @register="registerModal" @success="handleSuccess" />
        <!-- 预回复 -->
        <pre-reply-form @register="registerReplyModal" @success="handleReplySuccess" />
        <!-- 文件预览 -->
         <UploadPreviewModal :value="previewFileList" @register="registerPreviewModal" :showDelete="false" />
    </template>
    <script lang="ts" setup name="completion">
    import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
    import { useListPage } from '/@/hooks/system/useListPage';
    import { downloadAudio, list} from './completion.api'
    import { columns, searchFormSchema } from './completion.data'
    import { useModal } from '/@/components/Modal';
    import { ref } from 'vue';
    //@ts-ignore
    import TicketEdit from './TicketEditForm.vue';
     //@ts-ignore
    import PreReplyForm from '../components/PreReplyForm/index.vue';
    //@ts-ignore
    import UploadPreviewModal from '/@/components/Upload/src/UploadPreviewModal.vue';
    import { useRoute, useRouter } from 'vue-router';
    import dayjs from 'dayjs';

    const route = useRoute();
    const router = useRouter();
    const [registerModal, { openModal }] = useModal();

    const [registerReplyModal, { openModal:openReplyModal }] = useModal();
    // const { createMessage, createConfirm } = useMessage();
    // 预览modal
    const [registerPreviewModal, { openModal: openPreviewModal }] = useModal();
    // 预览文件列表
    const previewFileList = ref<any[]>([]);
    // 列表页面公共参数、方法
    const { tableContext } = useListPage({
        designScope: 'ticket-list',
        tableProps: {
          title: '工单办结列表',
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
            width: 120,
            fixed: 'right',
          },
          beforeFetch: (params) => {
            console.log(params);
            // 增加processStatus字段
            let processStatus = 0;
            if(params.auditStatus === '0'){
              processStatus = 0;
            } else if(params.auditStatus === '1'){
              processStatus = 1;
            } 
            if(route?.query) {
               const {startTime:q_startTime, endTime:q_endTime, ...rest} = route.query;
                // @ts-ignore
               const startTime = q_startTime ? dayjs(q_startTime) : null;
                // @ts-ignore
               const endTime = q_endTime ? dayjs(q_endTime) : null;
               getForm?.()?.setFieldsValue?.({
                  ...rest,
                  ...(startTime&& endTime) ? {importTime: [startTime, endTime]} : {}
                });
              return Object.assign(params, {pageNum:  params.pageNo, processStatus, 
                ...rest,
                ...(startTime&& endTime) ? {importTime: [startTime, endTime].join(',')} : {}
              });
            } else {
              return Object.assign(params, {pageNum:  params.pageNo, processStatus});
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
            label: '下载录音',
            onClick: handleEdit.bind(null, record),
            // ifShow: () => hasPermission('system:user:edit'),
          },
        ];
      }
    
      async function handleEdit(record: Recordable) {
        downloadAudio({ticketIds: record.id}).then(res => {
           console.log(res);
           if(res) {
             previewFileList.value = [{
                name: res.fileName,
                url: '/citizen-voice/' +res.fileKey,
                type: res.fileKey.split('.').pop(),
              }];
           } else if(Array.isArray(res) && res.length > 0) {
            previewFileList.value = res.map(item => {
              return {
                name: item.fileName,
                url: '/citizen-voice/' +item.fileKey,
                type: item.fileKey.split('.').pop(),
              };
            });
           } else {
            previewFileList.value = [];

           }
        }).catch(err => {
          console.log(err);
        })
        openPreviewModal(true, {
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
    </script>