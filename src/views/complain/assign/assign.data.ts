import { getDictItems } from '/@/api/common/api';
import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import dayjs, { Dayjs } from 'dayjs';
import { ref } from 'vue';
// acceptDepartment	受理单位	string	
// assignCommunitys	处理社区(名称逗号拼接)	string	
// assignDepts	处理科室(名称逗号拼接)	string	
// callPhoneNumber	来电号码	string	
// callTime	来电时间	string	
// callUserAddress	来电人地址	string	
// callUserName	来电人	string	
// caseNumber	案件编号	string	
// categoryOne	一级分类	string	
// categoryThree	三级分类	string	
// categoryTwo	二级分类	string	
// contactInfo	联系方式	string	
// createBy	创建人名称	string	
// createTime	创建时间	string	
// createUserId	创建人id	string	
// deadline	截止时间	string	
// finalResolveResult	处理情况	string	
// hotlineNumber	热线号码	string	
// id	id	integer	
// importTime	工单导入时间	string	
// labelCode	标签code	integer	
// mainContent	主要内容	string	
// monitorType	重点对象类型(0普通;其他)	integer	
// monthCount	月次	integer	
// occurrenceAddress	发生地址	string	
// orgId	所属部门	string	
// originalLabel	原始标签	string	
// processCode	流程节点编码	string	
// processName	流程节点名称	string	
// processStatus	流程节点状态，不需要审批的节点直接通过（-1审核不通过;0待审核;1审核通过）	integer	
// questionCategory	问题分类	string	
// receiveStatus	是否已接收（0否;1是）	integer	
// rejectReason	驳回原因	string	
// remark	备注	string	
// reportCommunityId	反应社区	string	
// reportDistrictId	反应管区	string	
// resolveCount	处理次数	integer	
// resolveDepartment	承办单位	string	
// resolveOpinion	处理意见	string	
// resolveTimeLimit	处理时限	integer	
// sendTime	派单时间	string	
// sendUser	派单人员	string	
// sevenFiveId	七有五性	integer	
// sourceType	数据来源(0本地录入;1区分转;2直派)	integer	
// title	标题	string	
// updateBy	修改人名称	string	
// updateTime	修改时间	string	
// updateUserId	修改人id	string	
// workOrderCategory	工单分类	string	
// workOrderNumber	工单编号	string	
// yearCount	年次    integer

//根据上面的内容生成表格的columns和搜索表单的schema
export const columns: BasicColumn[] = [
    { title: '受理单位', dataIndex: 'acceptDepartment', width: 150 },
    { title: '处理社区', dataIndex: 'assignCommunitys', width: 150 },
    { title: '处理科室', dataIndex: 'assignDepts', width: 150 },
    { title: '来电号码', dataIndex: 'callPhoneNumber', width: 150 },
    { title: '来电时间', dataIndex: 'callTime', width: 150 },
    { title: '来电人地址', dataIndex: 'callUserAddress', width: 180 },
    { title: '来电人', dataIndex: 'callUserName', width: 120 },
    { title: '案件编号', dataIndex: 'caseNumber', width: 150 },
    { title: '一级分类', dataIndex: 'categoryOne', width: 120 },
    { title: '三级分类', dataIndex: 'categoryThree', width: 120 },
    { title: '二级分类', dataIndex: 'categoryTwo', width: 120 },
    { title: '联系方式', dataIndex: 'contactInfo', width: 150 },
    { title: '创建人名称', dataIndex: 'createBy', width: 120 },
    { title: '创建时间', dataIndex: 'createTime', width: 150 },
    { title: '创建人id', dataIndex: 'createUserId', width: 120 },
    { title: '截止时间', dataIndex: 'deadline', width: 150 },
    { title: '处理情况', dataIndex: 'finalResolveResult', width: 180 },
    { title: '热线号码', dataIndex: 'hotlineNumber', width: 150 },
    { title: 'id', dataIndex: 'id', width: 80 },
    { title: '工单导入时间', dataIndex: 'importTime', width: 150 },
    { title: '标签code', dataIndex: 'labelCode', width: 120 },
    { title: '主要内容', dataIndex: 'mainContent', width: 200 },
    { title: '重点对象类型', dataIndex: 'monitorType', width: 150 },
    { title: '月次', dataIndex: 'monthCount', width: 80 },
    { title: '发生地址', dataIndex: 'occurrenceAddress', width: 180 },
    { title: '所属部门', dataIndex: 'orgId', width: 150 },
    { title: '原始标签', dataIndex: 'originalLabel', width: 120 },
    { title: '流程节点编码', dataIndex: 'processCode', width: 150 },
    { title: '流程节点名称', dataIndex: 'processName', width: 150 },
    { title: '流程节点状态', dataIndex: 'processStatus', width: 150 },
    { title: '问题分类', dataIndex: 'questionCategory', width: 120 },
    { title: '是否已接收', dataIndex: 'receiveStatus', width: 120 },
    { title: '驳回原因', dataIndex: 'rejectReason', width: 180 },
    { title: '备注', dataIndex: 'remark', width: 180 },
    { title: '反应社区', dataIndex: 'reportCommunityId', width: 150 },
    { title: '反应管区', dataIndex: 'reportDistrictId', width: 150 },
    { title: '处理次数', dataIndex: 'resolveCount', width: 120 },
    { title: '承办单位', dataIndex: 'resolveDepartment', width: 150 },
    { title: '处理意见', dataIndex: 'resolveOpinion', width: 180 },
    { title: '处理时限', dataIndex: 'resolveTimeLimit', width: 120 },
    { title: '派单时间', dataIndex: 'sendTime', width: 150 },
    { title: '派单人员', dataIndex: 'sendUser', width: 120 },
    { title: '七有五性', dataIndex: 'sevenFiveId', width: 120 },
    { title: '数据来源', dataIndex: 'sourceType', width: 120 },
    { title: '标题', dataIndex: 'title', width: 180 },
    { title: '修改人名称', dataIndex: 'updateBy', width: 120 },
    { title: '修改时间', dataIndex: 'updateTime', width: 150 },
    { title: '修改人id', dataIndex: 'updateUserId', width: 120 },
    { title: '工单分类', dataIndex: 'workOrderCategory', width: 150 },
    { title: '工单编号', dataIndex: 'workOrderNumber', width: 150 },
    { title: '年次', dataIndex: 'yearCount', width: 80 },
  ];

   const rangePresets = ref([
    { label: '今天', value: [dayjs().add(-1, 'd'), dayjs()] },
    { label: '近7天', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: '近1个月', value: [dayjs().add(-1, 'm'), dayjs()] },
    { label: '近3个月', value: [dayjs().add(-3, 'm'), dayjs()] },
  ]);

    export const searchFormSchema: FormSchema[] = [
    //   {
    //     label: '姓名',
    //     field: 'realname',
    //     component: 'Input',
    //     colProps: { span: 6 },
    //   },
    //   {
    //     label: '工号',
    //     field: 'workNo',
    //     component: 'Input',
    //     colProps: { span: 6 },
    //   },
    {
        label: '案件标签',
        field: 'labelCode',
        component: 'ApiSelect',
        componentProps: {
            api: async () => {
                const res  = await getDictItems('biz_complaint_lavel')
                console.log(res)
                if(Array.isArray(res)){
                    res.unshift({text: '所有', value: ''})
                    return res;
                } else {
                    return [];
                }
            },
            labelField: 'text',
            valueField: 'value'
        },
        colProps: { span: 6 }
    },
    {
        label: '状态',
        field: 'status',
        component: 'Select',
        componentProps: {
            options: [
                { label: '待接收', value: '0' },
                { label: '已接收', value: '1' },
            ],
            defaultValue: '0',
        },
        colProps: { span: 6 }
    },
    {
        label: '数据来源',
        field: 'sourceType',
        component: 'Select',
        componentProps: {
        options: [
            { label: '所有', value: '' },
            { label: '本地录入', value: '0' },
            { label: '区分转', value: '1' },
            { label: '直派', value: '2' },
        ],
        },
        colProps: { span: 6 },
    },
    {
        label: '导入时间',
        field: 'importTime',
        component: 'RangePicker',
        colProps: { span: 6 },
        componentProps: {
          presets: rangePresets,
        }
    },
    {
        label: '派单时间',
        field: 'sendTime',
        component: 'RangePicker',
        colProps: { span: 6 },
        componentProps: {
          presets: rangePresets,
        }
    },
    {
        label: '关键字',
        field: 'keyword',
        component: 'Input',
        componentProps: {
        placeholder: '标题\\内容\\来电号码\\发生地址',
        },
        colProps: { span: 6 },
    },
    {
        label: '案件编号',
        field: 'caseNumber',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '工单编号',
        field: 'workOrderNumber',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '标题',
        field: 'title',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '主要内容',
        field: 'mainContent',
        component: 'Input',
        colProps: { span: 6 },
    },
    {
        label: '重点对象',
        field: 'monitorType',
        component: 'Select',
        componentProps: {
        options: [
            { label: '==请选择==', value: '' },
            { label: '红名单', value: '0' },
            { label: '黑名单', value: '1' },
            { label: '失信名单', value: '3' },
        ],
        },
        colProps: { span: 6 },
    }
];

// 新增或者编辑表单项
export const formSchema: FormSchema[] = [
    {
      label: '数据来源',
      field: 'sourceType',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: '本地录入', value: '0' },
          { label: '区分转', value: '1' },
          { label: '直派', value: '2' },
        ],
      },
    },
    {
      label: '工单编号',
      field: 'workOrderNumber',
      component: 'Input',
      required: true,
    },
    {
      label: '案件编号',
      field: 'caseNumber',
      component: 'Input',
      required: true,
    },
    {
      label: '导入时间',
      field: 'importTime',
      component: 'DatePicker',
      required: true,
    },
    {
      label: '热线号码',
      field: 'hotlineNumber',
      component: 'Input',
    },
    {
      label: '受理单位',
      field: 'acceptDepartment',
      component: 'Input',
    },
    {
      label: '来电人',
      field: 'callUserName',
      component: 'Input',
      required: true,
    },
    {
      label: '来电号码',
      field: 'callPhoneNumber',
      component: 'Input',
      required: true,
    },
    {
      label: '联系方式',
      field: 'contactInfo',
      component: 'Input',
    },
    {
      label: '来电人地址',
      field: 'callUserAddress',
      component: 'Input',
    },
    {
      label: '发生地址',
      field: 'occurrenceAddress',
      component: 'Input',
    },
    {
      label: '问题分类',
      field: 'questionCategory',
      component: 'Input',
    },
    {
      label: '工单分类',
      field: 'workOrderCategory',
      component: 'Input',
      required: true,
    },
    {
      label: '一级分类',
      field: 'categoryOne',
      component: 'Input',
      required: true,
    },
    {
      label: '二级分类',
      field: 'categoryTwo',
      component: 'Input',
    },
    {
      label: '三级分类',
      field: 'categoryThree',
      component: 'Input',
    },
    {
      label: '标题',
      field: 'title',
      component: 'Input',
      required: true,
    },
    {
      label: '主要内容',
      field: 'mainContent',
      component: 'InputTextArea',
      required: true,
    },
    {
      label: '派单人员',
      field: 'sendUser',
      component: 'Input',
    },
    {
      label: '派单时间',
      field: 'sendTime',
      component: 'DatePicker',
      required: true,
    },
    {
      label: '处理意见',
      field: 'resolveOpinion',
      component: 'Input',
    },
    {
      label: '截止时间',
      field: 'deadline',
      component: 'DatePicker',
      required: true,
    },
    {
      label: '处理时限',
      field: 'resolveTimeLimit',
      component: 'Input',
    },
    {
      label: '处理情况',
      field: 'finalResolveResult',
      component: 'Input',
      required: true,
    },
    {
      label: '承办单位',
      field: 'resolveDepartment',
      component: 'Input',
    },
  ];


