import { BasicColumn, FormSchema } from "/@/components/Table";

export const columns: BasicColumn[] = [
    {
        title: '类别',
        dataIndex: 'name',
        width: 200,
    },
    {
        title: '诉求事项',
        dataIndex: 'category',
        width: 100,
    },
    {
        title: '标题',
        dataIndex: 'title',
        width: 100,
        slots: { customRender: 'title' },
    },
    {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
    }
]

export const searchFormSchema: FormSchema[] = [
  {
    label: '类别',
    field: 'category',
    component: 'Select',
    componentProps: {
      options: [
        { label: '经典案例', value: '0' },
        { label: '政策文件', value: '1' },
        { label: '政策解读', value: '2' },
        { label: '法律法规', value: '3' },
      ],
      allowClear: true
    },
    colProps: { span: 6 },
  },
  {
    label: '诉求事项',
    field: 'subCategory',
    component: 'Select',
    componentProps: {
      options: [
        { label: 'a', value: '0' },
        { label: 'b', value: '1' },
        { label: 'c', value: '2' },
      ],
      allowClear: true
    },
    colProps: { span: 6 },
  },
  {
    label: '关键词',
    field: 'keywords',
    component: 'Input',
    colProps: { span: 6 },
  },
]

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '类别',
    field: 'category',
    component: 'Select',
    componentProps: {
        options: [
            { label: '经典案例', value: '0' },
            { label: '政策文件', value: '1' },
            { label: '政策解读', value: '2' },
            { label: '法律法规', value: '3' },
        ],
        allowClear: true
    },
    required: true,
  },
  // 诉求事项
  {
    label: '诉求事项',
    field: 'subCategory',
    component: 'Select',
    componentProps: {
      options: [
        { label: 'a', value: '0' },
        { label: 'b', value: '1' },
        { label: 'c', value: '2' },
      ],
      allowClear: true
    },
    required: true,
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
    field: 'attachments',
    component: 'Upload',
    componentProps: {
    mode: 'multiple',
    allowClear: true,
    },
 },
]