import dayjs from 'dayjs';
import { uploadApi } from '/@/api/sys/upload';
import { FormSchema } from '/@/components/Form';


// 表单字段信息
export const formSchema: FormSchema[] = [
  // {
  //   field: 'specificHandleName',
  //   label: '经办人',
  //   component: 'Input',
  //   required: true,
  //   defaultValue: '城北街道',
  //   colProps: { span: 12 },
  //   componentProps: {
  //     readonly: true,
  //   }
  // },
  // {
  //   field: 'handleTime',
  //   label: '经办时间',
  //   component: 'DatePicker',
  //   componentProps: {
  //     showTime: true,
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     readonly: true,
  //   },
  //   required: true,
  //   defaultValue: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  //   colProps: { span: 12 }
  // },
  {
    field: 'handleResult',
    label: '经办结果',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请填写经办结果',
      rows: 6,
    },
    required: true,
    colProps: { span: 24 },
  },
  {
    field: 'checkType',
    label: '考核类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择考核类型',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'community',
    label: '社区/村',
    component: 'ApiSelect',
    componentProps: {
      placeholder: '请选择社区/村',
      api: () => Promise.resolve([]),  // 替换为实际API
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'questionCategory',
    label: '市问题分类',
    component: 'Select',
    componentProps: {
      placeholder: '请选择问题分类',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'minorPoint',
    label: '小区点位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入小区点位',
      showCount: true,
      maxlength: 300,
    },
    required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'isConnection',
    label: '是否联系',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否联系',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isResolved',
    label: '是否解决',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否解决',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isSatisfied',
    label: '是否满意',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否满意',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isFact',
    label: '是否属实',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否属实',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isPersonResponsible',
    label: '是否属于抓整促任务',
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'responsibilityType',
    label: '抓整促任务类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [],  // 需要从接口获取
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  // 以下是新增字段
  {
    field: 'returnDepartment',
    label: '归属行业部门',
    component: 'Select',
    componentProps: {
      placeholder: '请选择归属行业部门',
      options: [],
      allowClear: true,
    },
    required: true,
    colProps: { span: 24 },
  },
  {
    field: 'handleDetail',
    label: '办理依据',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请填写办理依据',
      rows: 4,
      showCount: true,
      maxlength: 1000,
    },
    required: true,
    colProps: { span: 24 },
  },
  {
    field: 'satisfactionTime',
    label: '满意时间',
    component: 'InputGroup',
    componentProps: {},
    colProps: { span: 24 },
    slot: 'satisfactionTimeSlot',
    defaultValue: [
      null,
      null
    ]
  },
  {
    field: 'contactTime',
    label: '联系时间',
    component: 'InputGroup',
    componentProps: {},
    colProps: { span: 24 },
    slot: 'contactTimeSlot',
    defaultValue: [
      null,
      null
    ]
  },
  {
    field: 'resolutionTime',
    label: '解决时间',
    component: 'InputGroup',
    componentProps: {},
    colProps: { span: 24 },
    slot: 'resolutionTimeSlot',
    defaultValue: [
      null,
      null
    ]
  },
  {
    field: 'sevenFiveAttributes',
    label: '七有五性',
    component: 'Select',
    componentProps: {
      placeholder: '请选择七有五性',
      options: [],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'finalProcessingDepartment',
    label: '最终处置部门',
    component: 'Select',
    componentProps: {
      placeholder: '请选择最终处置部门',
      options: [],
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'mainLeaderName',
    label: '主管领导姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入主管领导姓名',
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'departmentResponsiblePersonName',
    label: '部门负责人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入部门负责人姓名',
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificExecutorName',
    label: '具体承办人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入具体承办人姓名',
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificExecutorPosition',
    label: '具体承办人职务',
    component: 'Select',
    componentProps: {
      placeholder: '请选择具体承办人职务',
      options: [],
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isMeetWithComplainant',
    label: '是否已与诉求人见面',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否已与诉求人见面',
      options: [],
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isVisited',
    label: '是否吹哨',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否吹哨',
      options: [],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'promotionLevel',
    label: '是否提级办',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否提级办',
      options: [],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'isComplexCase',
    label: '是否疑难',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否疑难',
      options: [],
      allowClear: true,
    },
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'complaintType',
    label: '不计入诉求总量类别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择不计入诉求总量类别',
      options: [],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'caseLabel',
    label: '剔挂标签',
    component: 'Select',
    componentProps: {
      placeholder: '请输入剔挂标签',
      options: [],

      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'attachments',
    label: '附件',
    component: 'Upload',
    componentProps: {
      api: uploadApi, // 需要提供上传API
      multiple: true,
      maxSize: 20, // 限制大小，单位MB
      buttonText: '添加',
      uploadParams: {
        biz: 'complaint/attachment',
      },
    },
    required: true,
    colProps: { span: 24 },
    // 可以通过showTable来展示已上传文件列表
    helpMessage: '请上传附件',
  },
];