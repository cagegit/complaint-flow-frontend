<template>
<BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="'来电记录'"
      :width="1000"
      :showFooter="true"
      :maskClosable="false"
    >
      <div style="min-height: 350px">
         <BasicTable @register="registerTable" />
      </div>
    </BasicModal>
</template>
<script lang="ts" setup name="contact-history-list">
    import { ref, useAttrs } from 'vue';
    import { BasicTable } from '/@/components/Table';
    import { BasicModal, useModalInner } from '/@/components/Modal';


    import { list } from './contactHistory.api';
    import { columns, searchFormSchema } from './contactHistory.data';
    import { useListPage } from '/@/hooks/system/useListPage';


    // const emit = defineEmits(['register']);
    const $attrs = useAttrs();

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
          timeType.value = data.record.timeType;
          phoneNumber.value = data.record.callPhoneNumber;
          // reload();
        }
      }); 
</script>