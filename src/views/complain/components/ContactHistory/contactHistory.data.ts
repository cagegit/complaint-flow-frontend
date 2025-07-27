import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { render } from '/@/utils/common/renderUtils';
// 列表字段
export const columns: BasicColumn[] =[
  { title: 'id', dataIndex: 'id', width: 80 },
    { title: '数据来源', dataIndex: 'sourceType', width: 120,
    customRender: ({ text }) => {
      return render.renderDict(text, 'biz_source_type');
    }
  },
  { title: '案件编号', dataIndex: 'caseNumber', width: 150 },
  { title: '工单编号', dataIndex: 'workOrderNumber', slots: { customRender: 'workOrderNumberSlot' }, width: 150 },
  { title: '来电人', dataIndex: 'callUserName', width: 120 },
   { title: '来电号码', dataIndex: 'callPhoneNumber', width: 150 },
  { title: '来电时间', dataIndex: 'callTime', width: 150 },
  { title: '来电人地址', dataIndex: 'callAddress', width: 120 },
  { title: '反映社区', dataIndex: 'reportCommunityId', width: 150 },
  { title: '反映管区', dataIndex: 'reportDistrictId', width: 150 },
  { title: '标题', dataIndex: 'title', width: 180 },
  { title: '主要内容', dataIndex: 'mainContent', width: 200 },
  { title: '派单时间', dataIndex: 'sendTime', width: 150 },
  { title: '案件性质', dataIndex: 'caseNature', width: 150 },
  { title: '处理科室', dataIndex: 'assignDepts', width: 150 },
  { title: '处理社区', dataIndex: 'assignCommunitys', width: 150 },
  { title: '办结状态', dataIndex: 'bjStatus', width: 150 },
  { title: '办结时间', dataIndex: 'bjTime', width: 200 },
  { title: '书记批示', dataIndex: 'shujiSuggest', width: 150 },
  { title: '主任批示', dataIndex: 'zhurenSuggest', width: 150 },
  { title: '截止时间', dataIndex: 'deadline', width: 150 },
  // { title: '督办人', dataIndex: 'supervisor', width: 150 },
  // 若干字段
  // 热线号码
  { title: '热线号码', dataIndex: 'hotlineNumber', width: 150 },
  // 受理单位
  { title: '受理单位', dataIndex: 'acceptDepartment', width: 150 },
  // 导入时间
  { title: '导入时间', dataIndex: 'importTime', width: 150 },
  // 发生地址
  { title: '发生地址', dataIndex: 'occurrenceAddress', width: 150 },
  // 突发案件
  { title: '突发案件', dataIndex: 'suddenCase', width: 150 },
  // remark
  { title: '备注', dataIndex: 'remark', width: 200 }
]

// 搜索表单
export const searchFormSchema: FormSchema[] = [
  {
    field: 'caseNumber',
    label: '案件编号',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'workOrderNumber',
    label: '工单编号',
    component: 'Input',
    colProps: { span: 8 },
  },
];