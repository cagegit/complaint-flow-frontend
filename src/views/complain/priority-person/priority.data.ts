import { getDictItems } from '/@/api/common/api';
import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getDictItemsByCode } from '/@/utils/dict';
import { render } from '/@/utils/common/renderUtils';
// import { ref } from 'vue';

export const columns: BasicColumn[] = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '来电号码', dataIndex: 'phoneNumber', width: 130 },
  { title: '姓名', dataIndex: 'name', width: 180 },
  {
    title: '类别', dataIndex: 'type', width: 120, customRender: ({ record }) => {
      let text = '';
      let color = '';
      let array = getDictItemsByCode('biz_monitor_type') || [];
      let obj = array.filter((item) => {
        return item.value == record.type + '';
      });
      if (obj[0]) {
        text = obj[0].text;
        color = obj[0].color;
        return render.renderTag(text, color);
      } else {
        return text;
      }
    },
  },
  { title: '备注', dataIndex: 'remark', width: 180 },
];


export const searchFormSchema: FormSchema[] = [
  {
    label: '来电号码',
    field: 'phoneNumber',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '类别',
    field: 'type',
    component: 'ApiSelect',
    componentProps: {
      // options: [
      //     { label: '==请选择==', value: '' },
      //     { label: '红名单', value: '0' },
      //     { label: '黑名单', value: '1' },
      //     { label: '失信名单', value: '3' },
      // ],
      api: async () => {
        const res = await getDictItems('biz_monitor_type')
        if (Array.isArray(res)) {
          // res.forEach((v)=>{v.type = v.type+})
          res.unshift({ text: '==请选择==', value: '' })
          return res;
        } else {
          return [];
        }
      },
      labelField: 'text',
      valueField: 'value',

    },
    colProps: { span: 6 },
  }
];

// 新增或者编辑表单项
export const formSchema: FormSchema[] = [
  {
    label: '来电号码',
    field: 'phoneNumber',
    component: 'Input',
    rules: [{ required: true, pattern: /^1[3456789]\d{9}$/, message: '手机号码格式有误' }],
  },
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
    required: true,
  },
  {
    label: '类别',
    field: 'type',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      // options: [
      //     { label: '==请选择==', value: '' },
      //     { label: '红名单', value: '0' },
      //     { label: '黑名单', value: '1' },
      //     { label: '失信名单', value: '3' },
      // ],
      api: async () => {
        const res = await getDictItems('biz_monitor_type')
        if (Array.isArray(res)) {
          res.unshift({ text: '==请选择==', value: '' })
          return res;
        } else {
          return [];
        }
      },
      labelField: 'text',
      valueField: 'value',
    },
  },
  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
    required: false,
  }
];


