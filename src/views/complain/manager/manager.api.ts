import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum, paramsToQuery } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';

export enum Api {
  // 获取工单列表
  list = '/complain/manage/getManageList',
  // 编辑工单
  editComplain = '/complain/manage/editComplain',
  // 工单状态列表
  getProcessList = '/complain/manage/getProcessList',
  // 获取工单详情
  getManageInfo = '/complain/manage/getManageDetail',
  // 删除
  deleteComplain = '/complain/manage/deleteComplain',

  // 批量删除
  deleteBatchComplain = '/complain/manage/deleteComplain',

  //导出word工单
  exportTicketWord = '/complain/manage/exportTicketWord',

  // 导出剔除统计表
  exportKickOut = '/complain/manage/exportKickOut',
  //导出统计表
  exportExcelStatis = '/complain/manage/exportExcelStatis',
  //获取日报表字段
  getDayExcelColumns = '/complain/manage/getDayExcelColumns',
  //获取日报表字段
  exportDayExcel = '/complain/manage/exportDayExcel',
  //导出申请延期工单
  exportSqyqTicket = '/complain/manage/exportReqDelay',
  //导出申请提前销账工单
  exportTicketAdvance = '/complain/manage/exportReqEarlyRemove',
  //导出申请销账工单
  exportTicketDone = '/complain/manage/exportReqRemove',
  // 工单历史记录
  recordList = '/complain/manage/getTicketHistoryList',
  // 修改分配信息
  editAssignComplain = '/complain/manage/editAssignInfo',
}

/**
 * 处理参数
 */
const formatParams = (param) => {
  const params: any = pageNoToPageNum(param);
  console.log(params);

  // 导入时间范围处理
  if (params.importTime) {
    let dateList = params.importTime.split(',');
    if (dateList.length === 4) {
      // params.startImportTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
      // params.endImportTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
      params.startImportTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
      params.endImportTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
    }
    delete params.importTime;
  }

  // 派单时间范围处理
  if (params.sendTime) {
    let dateList = params.sendTime.split(',');
    if (dateList.length === 4) {
      params.startSendTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
      params.endSendTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
    }
    delete params.sendTime;
  }

  // 办结时间范围处理
  if (params.doneTime) {
    let dateList = params.doneTime.split(',');
    if (dateList.length === 4) {
      params.startDoneTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
      params.endDoneTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
    }
    delete params.doneTime;
  }

  // 开始回复审核时间	范围处理
  if (params.replyAuditTime) {
    let dateList = params.replyAuditTime.split(',');
    if (dateList.length === 4) {
      params.startReplyAuditTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
      params.endReplyAuditTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
    }
    delete params.replyAuditTime;
  }
  // 处理社区、委员也 也是传参这里 只穿最后一个id
  if (params.assignCommunityId) {
    params.assignCommunityId = params.assignCommunityId.split(',').pop();
  }
  if (params.sevenFiveId) {
    params.sevenFiveId = params.sevenFiveId.split(',').pop();
  }
  return params;
}


/**
 * 工单管理列表
 */
export const list = (param) => {
  const params = formatParams(param);
  return new Promise((resolve, reject) => {
    defHttp
      .get({ url: Api.list, params })
      .then((res) => {
        res.records = res.list;
        delete res.list;
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

/**
 * 添加工单
 */
// export const addTicket = (params) =>
//   defHttp.post(
//     { url: Api.addTicket, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } },
//   );

/**
 * 编辑工单
 */
export const editComplain = (params) =>
  defHttp.post({
    url: Api.editComplain,
    params
  });

/**
 * 通过id删除工单
 */
export const deleteTicket = (params) =>
  defHttp.post({
    url: Api.deleteComplain,
    params,
    headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED },
  });

/**
 * 批量删除工单
 */
export const deleteBatchTicket = (params) =>
  defHttp.post({
    url: Api.deleteBatchComplain,
    params,
    headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED },
  });

/**
 * 获取工单详情
 */
export const getManageInfo = (ticketId: string) => defHttp.get({ url: Api.getManageInfo + '?ticketId=' + ticketId });

/**
 * 获取工单状态列表
 */
export const getProcessList = () => defHttp.get({ url: Api.getProcessList });

/**
 * 获取日报表字段
 */
export const getDayExcelColumns = () => defHttp.get({ url: Api.getDayExcelColumns });

/**
 * 导出word工单
 */
export const exportTicketWord = (params) => defHttp.post({ url: paramsToQuery(Api.exportTicketWord, params), params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

/**
 * 导出剔除统计表
 */
export const exportKickOut = (params) => defHttp.post({ url: paramsToQuery(Api.exportKickOut, params), params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });


/**
 * 导出统计表
 */
export const exportExcelStatis = (param) => {
  const params = formatParams(param);
  return new Promise((resolve, reject) => {
    defHttp
      .post({ url: Api.exportExcelStatis, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } })
      .then((res) => {
        // res.records = res.list;
        // delete res.list;
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

/**
 * 导出日报表
 */
export const getExportDayExcel = (param) => {
  const params = formatParams(param);
  return new Promise((resolve, reject) => {
    defHttp
      .post({ url: Api.exportDayExcel, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

/**
 * 导出申请延期工单
 */
export const exportSqyqTicket = (param) => {
  return defHttp.post({ url: Api.exportSqyqTicket, data: param, headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED } })
};

/**
 * 导出申请提前销账工单
 */
export const exportTicketAdvance = (param) => {   
  return defHttp.post({ url: Api.exportTicketAdvance, data: param, headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED } })
}

/**
 * 导出申请销账工单
 */
export const exportTicketDone = (param) => {
  return defHttp.post({ url: Api.exportTicketDone, data: param, headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED } })
}

/**
 * 工单历史记录
 */
export const ticketRecordList = (param) => {
  if(param.column) {
    delete param.column;
  }
  if(param.order) {
    delete param.order;
  }
  const params = formatParams(param);
  return new Promise((resolve, reject) => {
    defHttp
      .get({ url: Api.recordList, params })
      .then((res) => {
        console.log(res);
        res.records = res.list;
        delete res.list;
        resolve(res);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

// 修改分配信息
export const editAssignComplain = (params) => {
  return defHttp.post({
    url: Api.editAssignComplain,
    params
  });
}