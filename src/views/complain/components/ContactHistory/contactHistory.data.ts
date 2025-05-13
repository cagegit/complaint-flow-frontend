import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// 列表字段
export const columns: BasicColumn[] =[

]

// 搜索表单
export const searchFormSchema: FormSchema[] = [
  {
    field: 'complainId',
    label: '投诉ID',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'contactType',
    label: '联系类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '电话', value: '1' },
        { label: '短信', value: '2' },
        { label: '微信', value: '3' },
        { label: 'QQ', value: '4' },
        { label: '其他', value: '5' },
      ],
    },
    colProps: { span: 8 },
  },
];