import dayjs from 'dayjs';
import { uploadApi } from '/@/api/sys/upload';
import { FormSchema } from '/@/components/Form';
import { getDistrictDictItemsByCode } from '/@/utils/dict';
import { getCityQuestionCategoryList, getCitySevenFiveList, getCommunityListByCode, getDisposeDepartmentList, getHoldRemoveList } from '/@/api/common/api';

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
  // {
  //   field: 'handleResult',
  //   label: '承办结果',
  //   component: 'InputTextArea',
  //   componentProps: {
  //     placeholder: '请填写承办结果',
  //     rows: 6,
  //   },
  //   // required: true,
  //   colProps: { span: 24 },
  //   itemProps: {
  //      wrapperCol: { span: 24, sm: { span: 21 } },
  //   }
  // },
  {
    field: 'assessmentType',
    label: '考核类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择考核类型',
      options: getDistrictDictItemsByCode('assessment_type'),
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'communityId',
    label: '社区/村',
    component: 'ApiSelect',
    componentProps: {
      placeholder: '请选择社区/村',
      api: async () => {
          try {
            const res  = await getCommunityListByCode()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id',  // 替换为实际API
      allowClear: true,
      showSearch: true
    },
    // required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'replyRequestType',
    label: '市问题分类',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择问题分类',
      api: async () => {
          try {
            const res  = await getCityQuestionCategoryList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id', 
      allowClear: true,
      showSearch: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'communityAddress',
    label: '小区点位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入小区点位',
      showCount: true,
      maxlength: 300,
    },
    // required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'isContact',
    label: '是否联系',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否联系',
      options: getDistrictDictItemsByCode('is_contact'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isSolved',
    label: '是否解决',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否解决',
      options: getDistrictDictItemsByCode('is_solved'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isSatisfaction',
    label: '是否满意',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否满意',
      options: getDistrictDictItemsByCode('is_satisfaction'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isTrue',
    label: '是否属实',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否属实',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isBelong',
    label: '是否属于疏整促任务',
    component: 'RadioGroup',
    componentProps:({formActionType, formModel}) => ({
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      onChange: (e:any) => {
        const { updateSchema } = formActionType;
        const value = e.target.value;
        // console.log(value);
        if(value == '0') {
          updateSchema([
            {
              field: 'taskType',
              componentProps: { 
                options:[
                  {label: '其他', value: '0'},
                ] 
              },
            },
          ]);
        } else {
          updateSchema([
            {
              field: 'taskType',
              componentProps: { 
                options: getDistrictDictItemsByCode('carding_type'),  // 需要从接口获取
              },
            },
          ]);
        }
        formModel['taskType'] = null;
      }
    }),
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'taskType',
    label: '疏整促任务类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: getDistrictDictItemsByCode('carding_type'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  // 以下是新增字段
  {
    field: 'industryOfficeId',
    label: '归属行业部门',
    component: 'Select',
    componentProps: {
      placeholder: '请选择归属行业部门',
      options: getDistrictDictItemsByCode('industry_office_id'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 24 },
    itemProps: {
       wrapperCol: { span: 24, sm: { span: 21 } },
    }
  },
  {
    field: 'handleBasisPolicy',
    label: '办理依据',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请填写办理依据',
      rows: 4,
      showCount: true,
      maxlength: 1000,
    },
    // required: true,
    colProps: { span: 24 },
    itemProps: {
       wrapperCol: { span: 24, sm: { span: 21 } },
    }
  },
  {
    field: 'replySatisfiedTime',
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
    field: 'replyContactTime',
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
    field: 'replyResolveTime',
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
  // {
  //   field: 'liveHoodIssueId',
  //   label: '七有五性',
  //   component: 'ApiCascader',
  //   componentProps: {
  //     placeholder: '请选择七有五性',
  //     api: async () => {
  //         try {
  //           const res  = await getCitySevenFiveList()
  //           console.log(res)
  //           if(Array.isArray(res)){
  //               return res;
  //           } else {
  //               return [];
  //           }
  //         } catch (error) {
  //           console.error(error);
  //           return [];
  //         }
  //     },
  //     labelField: 'name',
  //     valueField: 'id',
  //     allowClear: true,
  //     showSearch: true,
  //   },
  //   colProps: { span: 12 },
  // },
  {
    field: 'lastOfficeId',
    label: '最终处置部门',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择最终处置部门',
      api: async () => {
          try {
            const res  = await getDisposeDepartmentList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id', 
      allowClear: true,
      showSearch: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'competentLeader',
    label: '主管领导姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入主管领导姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'departmentHead',
    label: '部门负责人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入部门负责人姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificHandleName',
    label: '具体承办人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入具体承办人姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificHandleDuty',
    label: '具体承办人职务',
    component: 'Select',
    componentProps: {
      placeholder: '请选择具体承办人职务',
      options: getDistrictDictItemsByCode('specific_handle_duty'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'isAppealMeet',
    label: '是否已与诉求人见面',
    component: 'Select',
    componentProps:() =>({
      placeholder: '请选择是否已与诉求人见面',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    }),
    // required: true,
    colProps: { span: 12 },
  },
  // 选择是的时候，展示见面时间，见面地点
  {
    field: 'meetTime',
    label: '见面时间',
    component: 'DatePicker',
    componentProps: {
      placeholder: '请选择见面时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isAppealMeet == '1';
    }
  },
  {
    field: 'meetPlace',
    label: '见面地点',
    component: 'Input',
    componentProps: {
      placeholder: '请输入见面地点',
      showCount: true,
      maxlength: 100,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isAppealMeet == '1';
    }
  },
  {
    field: 'isWhistle',
    label: '是否吹哨',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否吹哨',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择是的时候，展示吹哨结果、吹哨部门
  {
    field: 'whistleResult',
    label: '吹哨结果',
    component: 'Select',
    componentProps: {
      placeholder: '请输入吹哨结果',
      options: [
        { label: '未解决', value: '1' },
        { label: '解决', value: '2' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isWhistle == '1';
    }
  },
  {
    field: 'whistleDepartmentId',
    label: '吹哨部门',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择吹哨部门',
       api: async () => {
          try {
            const res  = await getDisposeDepartmentList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id',
      allowClear: true,
      showSearch: true
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isWhistle == '1';
    }
  },
  // {
  //   field: 'isRevisit',
  //   label: '是否回访',
  //   component: 'Select',
  //   componentProps: {
  //     placeholder: '请选择是否回访',
  //     options: [
  //       { label: '是', value: 1 },
  //       { label: '否', value: 0 },
  //     ],
  //     allowClear: true,
  //   },
  //   colProps: { span: 12 },
  // },
  {
    field: 'mention',
    label: '是否提级办',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否提级办',
       options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择是的时候，展示提级办人员、提级办职务
  {
    field: 'mentionUserName',
    label: '提级办人员',
    component: 'Input',
    componentProps: {
      placeholder: '请输入提级办人员',
      showCount: true,
      maxlength: 100,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.mention == '1';
    }
  },
  {
    field: 'mentionType',
    label: '提级办职务',
    component: 'Select',
    componentProps: {
      placeholder: '请选择提级办职务',
      options: getDistrictDictItemsByCode('mention_type '),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.mention == '1';
    }
  },
  {
    field: 'isQuota',
    label: '是否限额',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否限额',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  // 选择是的时候，展示工程类别（下拉）、工程具体问题（下拉）
  {
    field: 'worksCategory',
    label: '工程类别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择工程类别',
      options: getDistrictDictItemsByCode('works_category'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isQuota == '1';
    }
  },
  {
    field: 'worksProblem',
    label: '工程具体问题',
    component: 'Select',
    componentProps: {
      placeholder: '请选择工程具体问题',
      options: getDistrictDictItemsByCode('works_problem'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isQuota == '1';
    }
  },
  {
    field: 'appeal',
    label: '不计入诉求总量类别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择不计入诉求总量类别',
      options: getDistrictDictItemsByCode('appeal_category'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择2的时候，展示网络平台名称
  {
    field: 'networkPlatform',
    label: '网络平台名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入网络平台名称',
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.appeal == '2';
    }
  },
  {
    field: 'hangingAccountsLabel',
    label: '剔挂标签',
    component: 'Select',
    componentProps: ({formActionType, formModel}) => ({
      placeholder: '请输入剔挂标签',
      options: getDistrictDictItemsByCode('hanging_accounts_label'),  // 需要从接口获取
      allowClear: true,
      onChange: (value) => {
        const { updateSchema } = formActionType;
        // console.log('caseLabel: ');
        // console.log(value);
        if(value == '1' || value == '2') {
          updateSchema([
            {
              field: 'removeHangingAccountsTypeId',
              component: 'ApiCascader',
              componentProps: { 
                 api: async () => {
                    let finalId = ''
                    if(value == '1') {
                      finalId = '3'
                    } else {
                      finalId = '2'
                    }
                    try {
                      const res  = await getHoldRemoveList(finalId)
                      // console.log(res)
                      if(Array.isArray(res)){
                          return res;
                      } else {
                          return [];
                      }
                    } catch (error) {
                      console.error(error);
                      return [];
                    }
                },
                placeholder: '请选择剔除挂账类型',
                labelField: 'name',
                valueField: 'id',
                allowClear: true,
                showSearch: true
              },
            },
          ]);
        } else {
          updateSchema([
            {
              field: 'removeHangingAccountsTypeId',
              component: 'Select',
              componentProps: { 
                 placeholder: '请选择剔除挂账类型',
                 options:[],
                allowClear: true,
              },
            },
          ]);
        }
        formModel['removeHangingAccountsTypeId'] = null;
      }
    }),
    colProps: { span: 12 },
  },
  // 选择非3的时候，展示剔除挂账类型
  {
    field: 'removeHangingAccountsTypeId',
    label: '剔除挂账类型',
     component: 'Select',
    componentProps: {
      placeholder: '请选择剔除挂账类型',
      options:[],
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.hangingAccountsLabel == '1' || values.hangingAccountsLabel == '2';
    }
  },
  // {
  //   field: 'attachments',
  //   label: '附件',
  //   component: 'Upload',
  //   slot: 'uploadAttachmentsSlot',
  //   colProps: { span: 24 },
  //   itemProps: {
  //      wrapperCol: { span: 24, sm: { span: 21 } },
  //   },
  //   // 可以通过showTable来展示已上传文件列表
  //   helpMessage: '请上传附件',
  // },
];

export const formFinalSchema: FormSchema[] = [
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
  // {
  //   field: 'handleResult',
  //   label: '承办结果',
  //   component: 'InputTextArea',
  //   componentProps: {
  //     placeholder: '请填写承办结果',
  //     rows: 6,
  //   },
  //   // required: true,
  //   colProps: { span: 24 },
  //   itemProps: {
  //      wrapperCol: { span: 24, sm: { span: 21 } },
  //   }
  // },
  {
    field: 'assessmentType',
    label: '考核类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择考核类型',
      options: getDistrictDictItemsByCode('assessment_type'),
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'communityId',
    label: '社区/村',
    component: 'ApiSelect',
    componentProps: {
      placeholder: '请选择社区/村',
      api: async () => {
          try {
            const res  = await getCommunityListByCode()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id',  // 替换为实际API
      allowClear: true,
      showSearch: true
    },
    // required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'replyRequestType',
    label: '市问题分类',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择问题分类',
      api: async () => {
          try {
            const res  = await getCityQuestionCategoryList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id', 
      allowClear: true,
      showSearch: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'communityAddress',
    label: '小区点位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入小区点位',
      showCount: true,
      maxlength: 300,
    },
    // required: true,
    colProps: { span: 12 },
    helpComponentProps: {
      text: '智能推荐',
    },
  },
  {
    field: 'isContact',
    label: '是否联系',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否联系',
      options: getDistrictDictItemsByCode('is_contact'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isSolved',
    label: '是否解决',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否解决',
      options: getDistrictDictItemsByCode('is_solved'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isSatisfaction',
    label: '是否满意',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否满意',
      options: getDistrictDictItemsByCode('is_satisfaction'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isTrue',
    label: '是否属实',
    component: 'Select',
    componentProps: {
      placeholder: '请输入是否属实',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'isBelong',
    label: '是否属于疏整促任务',
    component: 'RadioGroup',
    componentProps:({formActionType, formModel}) => ({
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      onChange: (e:any) => {
        const { updateSchema } = formActionType;
        const value = e.target.value;
        // console.log(value);
        if(value == '0') {
          updateSchema([
            {
              field: 'taskType',
              componentProps: { 
                options:[
                  {label: '其他', value: '0'},
                ] 
              },
            },
          ]);
        } else {
          updateSchema([
            {
              field: 'taskType',
              componentProps: { 
                options: getDistrictDictItemsByCode('carding_type'),  // 需要从接口获取
              },
            },
          ]);
        }
        formModel['taskType'] = null;
      }
    }),
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'taskType',
    label: '疏整促任务类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: getDistrictDictItemsByCode('carding_type'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  // 以下是新增字段
  {
    field: 'industryOfficeId',
    label: '归属行业部门',
    component: 'Select',
    componentProps: {
      placeholder: '请选择归属行业部门',
      options: getDistrictDictItemsByCode('industry_office_id'),  // 需要从接口获取
      allowClear: true,
    },
    // required: true,
    colProps: { span: 24 },
    itemProps: {
       wrapperCol: { span: 24, sm: { span: 21 } },
    }
  },
  {
    field: 'handleBasisPolicy',
    label: '办理依据',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请填写办理依据',
      rows: 4,
      showCount: true,
      maxlength: 1000,
    },
    // required: true,
    colProps: { span: 24 },
    itemProps: {
       wrapperCol: { span: 24, sm: { span: 21 } },
    }
  },
  {
    field: 'replySatisfiedTime',
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
    field: 'replyContactTime',
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
    field: 'replyResolveTime',
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
  // {
  //   field: 'liveHoodIssueId',
  //   label: '七有五性',
  //   component: 'ApiCascader',
  //   componentProps: {
  //     placeholder: '请选择七有五性',
  //     api: async () => {
  //         try {
  //           const res  = await getCitySevenFiveList()
  //           console.log(res)
  //           if(Array.isArray(res)){
  //               return res;
  //           } else {
  //               return [];
  //           }
  //         } catch (error) {
  //           console.error(error);
  //           return [];
  //         }
  //     },
  //     labelField: 'name',
  //     valueField: 'id',
  //     allowClear: true,
  //     showSearch: true,
  //   },
  //   colProps: { span: 12 },
  // },
  {
    field: 'lastOfficeId',
    label: '最终处置部门',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择最终处置部门',
      api: async () => {
          try {
            const res  = await getDisposeDepartmentList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id', 
      allowClear: true,
      showSearch: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'competentLeader',
    label: '主管领导姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入主管领导姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'departmentHead',
    label: '部门负责人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入部门负责人姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificHandleName',
    label: '具体承办人姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入具体承办人姓名',
    },
    // required: true,
    colProps: { span: 12 },
  },
  {
    field: 'specificHandleDuty',
    label: '具体承办人职务',
    component: 'Select',
    componentProps: {
      placeholder: '请选择具体承办人职务',
      options: getDistrictDictItemsByCode('specific_handle_duty'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  {
    field: 'isAppealMeet',
    label: '是否已与诉求人见面',
    component: 'Select',
    componentProps:() =>({
      placeholder: '请选择是否已与诉求人见面',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    }),
    // required: true,
    colProps: { span: 12 },
  },
  // 选择是的时候，展示见面时间，见面地点
  {
    field: 'meetTime',
    label: '见面时间',
    component: 'DatePicker',
    componentProps: {
      placeholder: '请选择见面时间',
      format: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isAppealMeet == '1';
    }
  },
  {
    field: 'meetPlace',
    label: '见面地点',
    component: 'Input',
    componentProps: {
      placeholder: '请输入见面地点',
      showCount: true,
      maxlength: 100,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isAppealMeet == '1';
    }
  },
  {
    field: 'isWhistle',
    label: '是否吹哨',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否吹哨',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择是的时候，展示吹哨结果、吹哨部门
  {
    field: 'whistleResult',
    label: '吹哨结果',
    component: 'Select',
    componentProps: {
      placeholder: '请输入吹哨结果',
      options: [
        { label: '未解决', value: '1' },
        { label: '解决', value: '2' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isWhistle == '1';
    }
  },
  {
    field: 'whistleDepartmentId',
    label: '吹哨部门',
    component: 'ApiCascader',
    componentProps: {
      placeholder: '请选择吹哨部门',
       api: async () => {
          try {
            const res  = await getDisposeDepartmentList()
            // console.log(res)
            if(Array.isArray(res)){
                return res;
            } else {
                return [];
            }
          } catch (error) {
            console.error(error);
            return [];
          }
      },
      labelField: 'name',
      valueField: 'id',
      allowClear: true,
      showSearch: true
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isWhistle == '1';
    }
  },
  // {
  //   field: 'isRevisit',
  //   label: '是否回访',
  //   component: 'Select',
  //   componentProps: {
  //     placeholder: '请选择是否回访',
  //     options: [
  //       { label: '是', value: 1 },
  //       { label: '否', value: 0 },
  //     ],
  //     allowClear: true,
  //   },
  //   colProps: { span: 12 },
  // },
  {
    field: 'mention',
    label: '是否提级办',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否提级办',
       options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择是的时候，展示提级办人员、提级办职务
  {
    field: 'mentionUserName',
    label: '提级办人员',
    component: 'Input',
    componentProps: {
      placeholder: '请输入提级办人员',
      showCount: true,
      maxlength: 100,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.mention == '1';
    }
  },
  {
    field: 'mentionType',
    label: '提级办职务',
    component: 'Select',
    componentProps: {
      placeholder: '请选择提级办职务',
      options: getDistrictDictItemsByCode('mention_type '),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.mention == '1';
    }
  },
  {
    field: 'isQuota',
    label: '是否限额',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否限额',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
      allowClear: true,
    },
    // required: true,
    colProps: { span: 12 },
  },
  // 选择是的时候，展示工程类别（下拉）、工程具体问题（下拉）
  {
    field: 'worksCategory',
    label: '工程类别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择工程类别',
      options: getDistrictDictItemsByCode('works_category'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isQuota == '1';
    }
  },
  {
    field: 'worksProblem',
    label: '工程具体问题',
    component: 'Select',
    componentProps: {
      placeholder: '请选择工程具体问题',
      options: getDistrictDictItemsByCode('works_problem'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.isQuota == '1';
    }
  },
  {
    field: 'appeal',
    label: '不计入诉求总量类别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择不计入诉求总量类别',
      options: getDistrictDictItemsByCode('appeal_category'),  // 需要从接口获取
      allowClear: true,
    },
    colProps: { span: 12 },
  },
  // 选择2的时候，展示网络平台名称
  {
    field: 'networkPlatform',
    label: '网络平台名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入网络平台名称',
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.appeal == '2';
    }
  },
  {
    field: 'hangingAccountsLabel',
    label: '剔挂标签',
    component: 'Select',
    componentProps: ({formActionType, formModel}) => ({
      placeholder: '请输入剔挂标签',
      options: getDistrictDictItemsByCode('hanging_accounts_label'),  // 需要从接口获取
      allowClear: true,
      onChange: (value) => {
        const { updateSchema } = formActionType;
        // console.log('caseLabel: ');
        // console.log(value);
        if(value == '1' || value == '2') {
          updateSchema([
            {
              field: 'removeHangingAccountsTypeId',
              component: 'ApiCascader',
              componentProps: { 
                 api: async () => {
                    let finalId = ''
                    if(value == '1') {
                      finalId = '3'
                    } else {
                      finalId = '2'
                    }
                    try {
                      const res  = await getHoldRemoveList(finalId)
                      // console.log(res)
                      if(Array.isArray(res)){
                          return res;
                      } else {
                          return [];
                      }
                    } catch (error) {
                      console.error(error);
                      return [];
                    }
                },
                placeholder: '请选择剔除挂账类型',
                labelField: 'name',
                valueField: 'id',
                allowClear: true,
                showSearch: true
              },
            },
          ]);
        } else {
          updateSchema([
            {
              field: 'removeHangingAccountsTypeId',
              component: 'Select',
              componentProps: { 
                 placeholder: '请选择剔除挂账类型',
                 options:[],
                allowClear: true,
              },
            },
          ]);
        }
        formModel['removeHangingAccountsTypeId'] = null;
      }
    }),
    colProps: { span: 12 },
  },
  // 选择非3的时候，展示剔除挂账类型
  {
    field: 'removeHangingAccountsTypeId',
    label: '剔除挂账类型',
     component: 'Select',
    componentProps: {
      placeholder: '请选择剔除挂账类型',
      options:[],
      allowClear: true,
    },
    colProps: { span: 12 },
    ifShow: ({values}) => {
      return values.hangingAccountsLabel == '1' || values.hangingAccountsLabel == '2';
    }
  },
  {
    field: 'attachments',
    label: '附件',
    component: 'Upload',
    slot: 'uploadAttachmentsSlot',
    colProps: { span: 24 },
    itemProps: {
       wrapperCol: { span: 24, sm: { span: 21 } },
    },
    // 可以通过showTable来展示已上传文件列表
    helpMessage: '请上传附件',
  },
]

// 表单业务逻辑判断方法
export function preFormLogicHandler(upReply:any,updateSchema:(items:any) => void) {
  // 疏整任务
  if(upReply?.isBelong == '0') {
      updateSchema([
        {
          field: 'taskType',
          componentProps: { 
            options:[
              {label: '其他', value: '0'},
            ] 
          },
        },
      ]);
    } else {
      updateSchema([
        {
          field: 'taskType',
          componentProps: { 
            options: getDistrictDictItemsByCode('carding_type'),  // 需要从接口获取
          },
        },
      ]);
  }
  // 剔挂标签
  if(upReply?.hangingAccountsLabel == '1' || upReply?.hangingAccountsLabel == '2') {
    updateSchema([
      {
        field: 'removeHangingAccountsTypeId',
        component: 'ApiCascader',
        componentProps: { 
            api: async () => {
              let finalId = ''
              if(upReply?.hangingAccountsLabel == '1') {
                finalId = '3'
              } else {
                finalId = '2'
              }
              try {
                const res  = await getHoldRemoveList(finalId)
                // console.log(res)
                if(Array.isArray(res)){
                    return res;
                } else {
                    return [];
                }
              } catch (error) {
                console.error(error);
                return [];
              }
          },
          placeholder: '请选择剔除挂账类型',
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          showSearch: true
        },
      },
    ]);
  } else {
    updateSchema([
      {
        field: 'removeHangingAccountsTypeId',
        component: 'Select',
        componentProps: { 
            placeholder: '请选择剔除挂账类型',
            options:[],
          allowClear: true,
        },
      },
    ]);
  }
}