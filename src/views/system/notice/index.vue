<template>
  <div class="container">
    <a-button type="primary" @click="handleAdd" style="margin-bottom: 16px"> 新建 </a-button>

    <a-table :dataSource="dataSource" :columns="columns" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.key)">
              <a style="color: red">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑记录' : '新建记录'" @ok="handleSubmit" @cancel="handleCancel">
      <a-form :model="formState" :label-col="{ span: 4 }">
        <a-form-item label="姓名">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="年龄">
          <a-input-number v-model:value="formState.age" style="width: 100%" />
        </a-form-item>
        <a-form-item label="地址">
          <a-input v-model:value="formState.address" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
    },
  ];

  const dataSource = ref([
    {
      key: '1',
      name: '张三',
      age: 25,
      address: '北京市朝阳区',
    },
    {
      key: '2',
      name: '李四',
      age: 30,
      address: '上海市浦东新区',
    },
  ]);

  const modalVisible = ref(false);
  const isEdit = ref(false);
  const formState = reactive({
    key: '',
    name: '',
    age: null,
    address: '',
  });

  const handleadd = () => {
    isEdit.value = false;
    resetForm();
    modalVisible.value = true;
  };

  const handleedit = (record) => {
    isEdit.value = true;
    Object.assign(formState, record);
    modalVisible.value = true;
  };

  const handledelete = (key) => {
    dataSource.value = dataSource.value.filter((item) => item.key !== key);
  };

  const handlesubmit = () => {
    if (isEdit.value) {
      // 更新操作
      const index = dataSource.value.findIndex((item) => item.key === formState.key);
      datasource.value[index] = { ...formState };
    } else {
      // 新增操作
      dataSource.value.push({
        ...formState,
        key: Date.now().toString(),
      });
    }
    modalVisible.value = false;
    resetForm();
  };

  const handlecancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  const resetform = () => {
    Object.assign(formState, {
      key: '',
      name: '',
      age: null,
      address: '',
    });
  };
</script>

<style scoped>
  .container {
    padding: 24px;
  }
</style>
