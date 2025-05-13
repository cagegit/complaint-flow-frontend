<template>
<BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :title="'来电记录'"
      :width="1000"
      :showFooter="false"
      destroyOnClose
      :maskClosable="false"
    >
      <div>
         <BasicTable @register="registerTable" />
      </div>
    </BasicModal>
</template>
<script lang="ts" setup name="ContactHistory">
    import { useAttrs } from 'vue';
    import { BasicTable } from '/@/components/Table';
    import { BasicModal, useModalInner } from '/@/components/Modal';


    import { list } from './contactHistory.api';
    import { columns, searchFormSchema } from './contactHistory.data';
    import { useListPage } from '/@/hooks/system/useListPage';


    const emit = defineEmits(['register']);
    const $attrs = useAttrs();
   // 列表页面公共参数、方法
    const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
        designScope: 'Contact-history-list',
        tableProps: {
          title: '手机号来电记录',
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
      // 注册弹窗
      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        console.log(data);
      }); 
</script>