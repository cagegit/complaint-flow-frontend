import { getDictItems } from '/@/api/common/api';
import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getDictItemsByCode } from '/@/utils/dict';
import { render } from '/@/utils/common/renderUtils';
// import { ref } from 'vue';

// 新增或者编辑表单项
export const formSchema: FormSchema[] = [
  {
    field: 'cycleDayNumber',
    label: '周期-日',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 1,
      max: 31,
      addonAfter: '',
    },
    colProps: { span: 12 },
  },
  {
    field: 'cycleTime',
    label: '周期时间',
    component: 'TimePicker',
    required: true,
    componentProps: {
      showTime: true,
      format: 'HH:mm:ss',
    },
    colProps: { span: 12 },
  }
];


