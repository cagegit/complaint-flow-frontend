import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '部门',
    dataIndex: 'deptName',
    key: 'deptName',
    width: 200,
    customRender: ({ text }) => {
      return text || '-';
    },
  },
  {
    title: '诉求事项',
    dataIndex: 'optionText',
    key: 'optionText',
    width: 100,
    customRender: ({ text }) => {
      return text || '-';
    },
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
];

export const departmentConfig = {
  label: '部门',
  field: 'deptName',
  component: 'Select',
  componentProps: {
    options: [],
    allowClear: true,
  },
  colProps: { span: 6 },
  slot: 'department',
};

export const optionsTextConfig = {
  label: '诉求事项',
  field: 'optionText',
  component: 'Select',
  componentProps: {
    options: [],
    allowClear: true,
  },
  colProps: { span: 6 },
  slot: 'options',
};

export const keywordsConfig = {
  label: '关键词',
  field: 'keyword',
  component: 'Input',
  colProps: { span: 6 },
};

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '部门',
    field: 'deptName',
    component: 'Select',
    componentProps: {
      options: [],
      allowClear: true,
      showSearch: true,
    },
    required: false,
  },
  // 诉求事项
  {
    label: '诉求事项',
    field: 'optionText',
    component: 'Select',
    componentProps: {
      options: [],
      allowClear: true,
      showSearch: true,
    },
    required: false,
  },
  // 标题
  {
    label: '标题',
    field: 'title',
    component: 'Input',
    required: true,
  },
  // 内容
  {
    label: '内容',
    field: 'content',
    component: 'JEditor',
    required: true,
  },
  // 附件
  {
    label: '附件',
    field: 'addFileIdList',
    component: 'JUpload',
    componentProps: {
      bizPath: 'knowledge/upload',
      returnUrl: false,
      multiple: true,
    },
  },
];
