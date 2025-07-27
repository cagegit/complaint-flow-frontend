<template>
    <BasicModal
      v-bind="$attrs"
      @register="registerDrawer"
      :title="getTitle"
      :width="1000"
      :showFooter="false"
      destroyOnClose
      :maskClosable="false"
    >
      <div class="pl-18">
        <!-- 拒绝信息 -->
        <!-- <RejectInfo :detailInfo="ticketDetail" /> -->
        <!-- 基本信息区域 -->
        <BasicForm @register="registerForm"/>
      </div>
    </BasicModal>
  </template>
  <script lang="ts" setup>
    import { ref, computed, useAttrs } from 'vue';
    import { BasicForm, useForm } from '/@/components/Form/index';
    import { formSchema } from '../../bizComplaintTicketList/ticket.data';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    // import { addTicket, editTicket } from './ticket.api';
    // import { getTicketInfoInTurnOut } from '../turn-out/out.api';
    import { getComplaintDetail } from '/@/api/common/api';
    // @ts-ignore 领导批示组件
    import LeaderInstruction from '../components/LeaderInstruction/index.vue';
    // @ts-ignore
    import RejectInfo from '../components/RejectInfo/index.vue';

    
    // 声明Emits
    const emit = defineEmits(['success', 'register']);
    const attrs = useAttrs();
    const isUpdate = ref(true);
    const rowId = ref('');
    const inTurnOut = ref(false);
    const departOptions = ref([]);
    let isFormDepartUser = false;
    // 表单详情
    const ticketDetail = ref<any>({});
    //表单配置
    const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
      labelWidth: 150,
      schemas: formSchema,
      showActionButtonGroup: false,
      layout: 'vertical',
      rowProps: { gutter: 24, justify: 'center', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 8 },
      //row行的样式
      baseRowStyle: { width: '100%', },
      disabled: true, // 禁用表单
    });
    // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
    const showFooter = ref(true);
    let currentRecord:any = null;
    const currentUnionRecord = ref<any>(null);
    //表单赋值
    const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
      await resetFields();
      showFooter.value = data?.showFooter ?? true;
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;
      inTurnOut.value = !!data?.inTurnOut;
      console.log(data);
      currentRecord = data.record;
      // 无论新增还是编辑，都可以设置表单值
      try {
        // 查询工单详情
        // const detailRes = await getTicketInfoInTurnOut({ticketId:data.record.id});
        const res = await getComplaintDetail(data.record.id);
        console.log(res);
        currentUnionRecord.value = {
          ...data.record,
          ...(res ? res : {})
        };
        // 工单详情
        ticketDetail.value = res;
        if (typeof data.record === 'object') {
            setFieldsValue({
                ...data.record,
                ... (res ? res : {})
            });
        } else {
            setFieldsValue({
                sourceType: 0,
            });
        }
      } catch (error) {
        console.error('获取工单详情失败', error);
      }
     
      // 判断是否禁用数据来源下拉
      updateSchema(
        {
            field: 'sourceType',
            componentProps: {
              disabled: !isUpdate.value,
            }
        }
      )
      // 隐藏底部时禁用整个表单
      //update-begin-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
      //   setProps({ disabled: !showFooter.value });
      //update-end-author:taoyan date:2022-5-24 for: VUEN-1117【issue】0523周开源问题
    });
    //获取标题
    const getTitle = computed(() => {
      return '工单详情';
    });
    // const { adaptiveWidth } = useDrawerAdaptiveWidth();
</script>
  