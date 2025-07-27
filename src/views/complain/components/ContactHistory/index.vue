<template>
<BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="'来电记录'"
      :width="1000"
      :footer="null"
      :maskClosable="false"
    >
  <div style="min-height: 350px">
      <BasicTable @register="registerTable" > 
        <template #workOrderNumberSlot="{ text, record }">
          <a href="javascript:void(0)" @click="showDetailModal(record)">{{ text }}</a>
        </template>
      </BasicTable>
  </div>
</BasicModal>
<!-- 工单详情 -->
<TicketDetailModal  @register="registerDetailModal" />
</template>
<script lang="ts" setup name="contact-history-list">
    import { ref, useAttrs } from 'vue';
    import { BasicTable } from '/@/components/Table';
    import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
    // @ts-ignore
    import TicketDetailModal from './TicketDetailModal.vue';

    import { list } from './contactHistory.api';
    import { columns, searchFormSchema } from './contactHistory.data';
    import { useListPage } from '/@/hooks/system/useListPage';


    // const emit = defineEmits(['register']);
    const $attrs = useAttrs();

   // 注册工单详情
   const [registerDetailModal, { openModal }] = useModal();

   // 列表页面公共参数、方法
    const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
        designScope: 'contact-history-list',
        tableProps: {
          title: '来电记录',
          api: list,
          columns: columns,
          size: 'small',
          formConfig: {
            // labelWidth: 200,
            schemas: searchFormSchema,
          },
          showActionColumn:false,
          beforeFetch: (params) => {
            console.log(params);
            return Object.assign(params, { pageNum:  params.pageNo, phoneNumber: phoneNumber.value, timeType: timeType.value });
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
      const [registerTable, { reload }] = tableContext;
      // timeType 时间类型（1月；2年）
      const timeType = ref<string>('1');
      // 手机号
      const phoneNumber = ref<string>('');
      // 注册弹窗
      const [registerModal] = useModalInner(async (data) => {
        console.log(data);
        if(data.record) {
          let hasChange = false;
          if(data.record.timeType !== timeType.value || data.record.callPhoneNumber !== phoneNumber.value) {
              hasChange = true;
          }
          timeType.value = data.record.timeType;
          phoneNumber.value = data.record.callPhoneNumber;
          if(hasChange) {
            reload();
          }
        }
      }); 

      // 打开详情弹窗
      const showDetailModal = (record: any) => {
        console.log(record);
        openModal(true, {
          isUpdate: false,
          record: record,
          showFooter: false,
        });
      };
</script>