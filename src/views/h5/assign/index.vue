<template>
  <div class="p-0">
    <div style="width: 100%; overflow: auto; padding: 20px 15px">
      <!-- 拒绝信息 -->
      <RejectInfo :detailInfo="ticketDetail" />
      <!-- 基本信息区域 -->
      <BasicForm @register="registerForm" />
      <!-- 领导批示区域 -->
      <LeaderInstruction
        v-if="ticketResult.id"
        :ticketId="ticketResult.id"
        :zrContent="ticketResult.zhurenSuggest"
        :sjContent="ticketResult.shujiSuggest"
        :style="{ width: '85%' }"
      />
    </div>
    <div style="width: 100%; overflow: auto; padding: 20px 15px 100px">
      <a-divider class="mb-4" orientation="center">转派信息<span class="text-red-600">(必填表单)</span></a-divider>
      <!-- 待补充信息区域 -->
      <BasicForm :schemas="addFormSchema" @register="registerAddForm" />
      <!-- 底部按钮 停靠在底部 -->
      <div class="flex justify-between mt-4 gap-2 fixed bottom-0 left-0 right-0 bg-white p-4">
        <a-button block @click="closeModal">关闭</a-button>
        <a-button type="primary" block :loading="confirmLoading" @click="handleSubmit">提交</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, useAttrs, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema, addFormSchema } from '/@/views/complain/assign/assign.data';
  // import { BasicModal, useModalInner } from '/@/components/Modal';
  import { addAssign, getAssignDetail } from '/@/views/complain/assign/assign.api';
  import { getCitySevenFiveList, getCommunityChildList, getComplaintDetail, getSecondTreeList } from '/@/api/common/api';
  // @ts-ignore
  import RejectInfo from '/@/views/complain/components/RejectInfo/index.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  // @ts-ignore 领导批示组件
  import LeaderInstruction from '/@/views/complain/components/LeaderInstruction/index.vue';
  import { useRoute } from 'vue-router';
  // 声明wx小程序web-view 对象
  declare const wx: any;

  const route = useRoute();

  const { createMessage } = useMessage();

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const attrs = useAttrs();
  const isUpdate = ref(true);
  const rowId = ref('');
  const departOptions = ref([]);
  let isFormDepartUser = false;
  // 当前表单内容
  let currentData: any = {};
  // 表单详情
  const ticketDetail = ref<any>({});
  // 接口返回详情
  const ticketResult = ref<any>({});
  const confirmLoading = ref(false);

  function setModalProps(props: any) {
    // 设置modal属性
    confirmLoading.value = props?.confirmLoading || false;
  }

  //表单配置
  const [registerForm, { setFieldsValue: setBasicFieldsValue }] = useForm({
    labelWidth: 100,
    schemas: formSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
    baseColProps: { span: 24 },
    //row行的样式
    baseRowStyle: { width: '100%' },
    // 禁用表单
    disabled: true,
  });
  //待补充表单配置
  const [registerAddForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    schemas: addFormSchema,
    showActionButtonGroup: false,
    layout: 'vertical',
    rowProps: { gutter: 24, justify: 'center', align: 'middle' },
    baseColProps: { span: 24 },
  });
  // TODO [VUEN-527] https://www.teambition.com/task/6239beb894b358003fe93626
  const showFooter = ref(true);

  function closeModal(data: any = null) {
    // 关闭当前页面,发送数据给打开页面并返回
    if (wx?.miniProgram) {
      wx?.miniProgram?.postMessage?.({
        data: JSON.stringify({
          action: 'postData',
          data: data,
        }),
      });
      wx?.miniProgram?.navigateBack?.();
    } else {
      // 如果是h5页面，直接关闭
      window?.history?.back?.();
    }
  }

  onMounted(async () => {
    // 从url获取record信息
    let data: any = {
      isUpdate: true,
      record: {},
    };
    try {
      if (route.query.record) {
        // 如果是字符串，转换为对象
        data.record = route.query.record ? JSON.parse(route.query.record as string) : {};
      }
    } catch (error) {
      console.error('Error parsing record from query:', error);
    }
    //表单赋值
    // const [registerDrawer, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    showFooter.value = data?.showFooter ?? true;
    // setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // 给当前data赋值
    currentData = data;
    console.log(data);
    let assignDetail: any = {};
    // 查询分派详情
    try {
      assignDetail = await getAssignDetail(data.record.id);
      // console.log(res);
      // 回显数据
      // if(assignDetail) {
      //   setFieldsValue({
      //     ...assignDetail,
      //     reportDistrictId: assignDetail?.assignCommunityList[0]?.parentOrgId || null,
      //     reportCommunityId: assignDetail?.assignCommunityList[0]?.orgId || null,
      //     assignDeptIdList: assignDetail?.assignDeptList?.map(v => v.orgId)?.join(',') || null,
      //   });
      // }
    } catch (error) {
      console.log(error);
    }
    // 无论新增还是编辑，都可以设置表单值
    if (typeof data.record === 'object') {
      // 从详情接口查询
      let res: any = {};
      try {
        res = await getComplaintDetail(data.record.id);
        console.log(res);
        ticketDetail.value = res;
        ticketResult.value = res;
        // 处理社区/居委会
        let communityList: any[] = [];
        if (Array.isArray(assignDetail?.assignCommunityList)) {
          assignDetail.assignCommunityList.forEach((v: any) => {
            if (v.orgId) {
              communityList.push([v.parentOrgId, v.orgId]);
            }
          });
        }
        console.log(communityList);
        // 转派表单回显
        setFieldsValue({
          ...res,
          caseNature: res?.caseNature ? res.caseNature + '' : null,
          labelCode: res?.labelCode ? res.labelCode + '' : null,
          // 处理科室
          assignDeptIdList: Array.isArray(assignDetail?.assignDeptList) ? assignDetail.assignDeptList.map((v) => v.orgId) : [],
          // 处理社区/居委会
          assignCommunityIdList: communityList,
        });
        // 反映社区回显
        if (res?.reportDistrictId) {
          getCommunityChildList(res?.reportDistrictId)
            .then((ksData) => {
              // console.log(ksData)
              if (Array.isArray(ksData)) {
                updateSchema({
                  field: 'reportCommunityId',
                  // required: true,
                  componentProps: {
                    options: ksData.map((v) => {
                      return {
                        label: v.departName,
                        value: v.id,
                      };
                    }),
                  },
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
        // 七有五性回显
        if (res?.sevenFiveId) {
          getCitySevenFiveList()
            .then((sevenFiveData) => {
              if (Array.isArray(sevenFiveData)) {
                sevenFiveData.forEach((item: any) => {
                  if (item.id == res.sevenFiveId) {
                    // res.sevenFiveId = item.name;
                    setFieldsValue({
                      sevenFiveId: item.allParentIds ? item.allParentIds.split(',') : [],
                    });
                  }
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } catch (error) {
        console.log(error);
      }
      setBasicFieldsValue({
        ...data.record,
        ...res,
      });
    }
  });
  //获取标题
  const getTitle = computed(() => {
    // update-begin--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
    if (!unref(isUpdate)) {
      return '转派工单';
    } else {
      return '工单分派';
    }
    // update-end--author:liaozhiyang---date:20240306---for：【QQYUN-8389】系统用户详情抽屉title更改
  });
  // const { adaptiveWidth } = useDrawerAdaptiveWidth();

  //提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      // values.userIdentity === 1 && (values.departIds = '');
      let isUpdateVal = unref(isUpdate);

      let params = values;
      console.log(JSON.stringify(params));
      // 处理科室或者处理社区有一个为空，提示错误
      if (!params.assignDeptIdList && !params.assignCommunityIdList) {
        // 提示错误
        setModalProps({ confirmLoading: false });
        createMessage.error('请选择处理科室或处理社区!');
        return;
      }
      console.log(params);
      let shequTreeList: any[] = [];
      try {
        shequTreeList = await getSecondTreeList('3');
      } catch (error) {
        console.log(error);
      }
      if (currentData) {
        // 处理社区
        if (params.assignCommunityIdList) {
          const newCommunityIdList = params.assignCommunityIdList.split(',');
          console.log(shequTreeList);
          const finalList: any[] = [];
          shequTreeList.forEach((v) => {
            const index = newCommunityIdList.indexOf(v.id);
            if (index > -1) {
              // 移除父节点id
              newCommunityIdList.splice(index, 1);
              // 如果newCommunityIdList不包含子节点id，则保存全部的子节点
              let hasChild = false;
              v.children?.forEach((item) => {
                if (newCommunityIdList.indexOf(item.id) > -1) {
                  hasChild = true;
                  finalList.push(item.id);
                }
              });
              // 如果没有子节点，则保存父节点下的全部子节点
              if (!hasChild) {
                v.children.forEach((item) => {
                  finalList.push(item.id);
                });
              }
            }
          });
          // newCommunityIdList 去重
          const uniqueCommunityIdList = Array.from(new Set(finalList));
          params.assignCommunityIdList = uniqueCommunityIdList;
        } else {
          params.assignCommunityIdList = [];
        }
        // 科室
        if (params.assignDeptIdList) {
          params.assignDeptIdList = params.assignDeptIdList.split(',');
        } else {
          params.assignDeptIdList = [];
        }
        // 七有五性
        let sevenFiveId;
        if (params.sevenFiveId) {
          let list = params.sevenFiveId.split(',');
          sevenFiveId = list[list.length - 1];
        }
        params = { ...params, id: currentData.record.id, sevenFiveId };
      }
      //提交表单
      await addAssign(params);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', { isUpdateVal, values });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
