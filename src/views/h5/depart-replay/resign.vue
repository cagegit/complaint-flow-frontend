<template>
  <div class="p-0 flex justify-center">
    <a-button :loading="confirmLoading" type="primary" @click="createModal">重新分派</a-button>
  </div>
</template>
<script lang="ts" setup>
  import { h, ref, onMounted } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import ApiCascader from '/@/components/Form/src/components/ApiCascader.vue';
  import { getAuthTree } from '/@/views/complain/follow-up/follow-up.api';
  import { Input } from 'ant-design-vue';
  import { assignOther } from '/@/views/complain/assign/assign.api';
  // 声明wx小程序web-view 对象
  declare const wx: any;

  const route = useRoute();

  const AInputTextArea = Input.TextArea;
  const { createMessage, createConfirm } = useMessage();

  const confirmLoading = ref(false);
  const orgId = ref<any>(null);
  const remark = ref<string>('');
  const isTransfer = ref<boolean>(false);

  function closeModal() {
    // 关闭当前页面,发送数据给打开页面并返回
    try {
      if (wx?.miniProgram) {
        wx?.miniProgram?.navigateBack?.();
      } else {
        // 如果是h5页面，直接关闭
        window?.history?.back?.();
      }
    } catch (err) {
      console.log(err);
    }
  }

  onMounted(async () => {
    createModal();
  });

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

  const createModal = () => {
    // 从url获取record信息
    let data: any = {
      isUpdate: true,
      record: {},
    };
    try {
      if (route.query) {
        data.record = {
          ...route.query,
          assignId: route.query.id,
        };
      }
    } catch (error) {
      console.error('Error parsing record from query:', error);
    }
    const fowardTitle = '指派单位';
    createConfirm({
      title: '是否重新分派选中的工单？',
      content: () => {
        // 使用 h 渲染函数创建 vnode
        return h('div', { style: { width: '100%' } }, [
          // h('p', '是否确认转出选中工单？'),
          h('p', fowardTitle + '：'),
          h(ApiCascader, {
            style: 'width: 100%;',
            placeholder: '请选择',
            styles: {
              width: '100%',
            },
            onChange: (val: any) => {
              console.log('val', val);
              orgId.value = val;
            },
            treeDataSimpleMode: true,
            api: async () => {
              const res = await getAuthTree(data.record.orgType);
              // console.log(res)
              if (Array.isArray(res)) {
                const newList = treeToList(res);
                return newList.map((v) => {
                  return {
                    id: v.id,
                    parentId: v.parentId,
                    label: v.departName,
                    value: v.id,
                  };
                });
              } else {
                return [];
              }
            },
          }),
          // 备注
          h('p', { style: { marginTop: ' 15px' } }, '备注：'),
          h(AInputTextArea, {
            style: 'width: 100%;',
            placeholder: '请输入备注',
            rows: 6,
            maxLength: 800,
            onChange: (e: any) => {
              remark.value = e.target.value;
            },
          }),
        ]);
      },
      iconType: 'warning',
      onOk: async () => {
        if (isTransfer.value) {
          // createMessage.warning('请勿重复操作');
          return Promise.reject('请勿重复操作');
        }
        // 添加类型参数
        if (orgId.value === '' || orgId.value === null || orgId.value === undefined) {
          createMessage.warning('请选择' + fowardTitle);
          return Promise.reject('未选择' + fowardTitle);
        }
        confirmLoading.value = true;
        isTransfer.value = true;
        try {
          await assignOther({
            assignId: data.record.assignId,
            // 取列表最后一项
            orgId: Array.isArray(orgId.value) && orgId.value.length > 0 ? orgId.value.pop() : orgId.value,
            remark: remark.value,
          });
          createMessage.success('分派成功');
          setTimeout(() => {
            closeModal();
          }, 2000);
        } catch (error: any) {
          console.error('分派失败', error);
          // createMessage.error(error?.message || '分派失败');
        } finally {
          isTransfer.value = false;
          confirmLoading.value = false;
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
  };
</script>
