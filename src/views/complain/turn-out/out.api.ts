import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';
import qs from 'qs';
export enum Api {
  // 获取工单列表
  list = '/complain/turnOut/getTurnOutList',
  // 批量转出工单
  forwardTicketBatch = '/complain/turnOut/turnOutBatch',
  // 转出工单
  forwardTicket = '/complain/turnOut/turnOutById',
  // 转出到市
  forwardTicketToCity = '/complain/turnOut/turnOutCity',
  // 转出到区
  forwardTicketToDistrict = '/complain/turnOut/turnOutArea',
  // 获取工单详情
  getTicketInfo = '/complain/assign/getAssignDetail',
}
/**
 * 已接收列表
 */
export const list = (param) => {
    const params:any = pageNoToPageNum(param);
    console.log(params);
    // 导入时间范围处理
    if(params.importTime) {
      let dateList = params.importTime.split(',');
      if(dateList.length === 4) {
        params.startImportTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
        params.endImportTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
      }
        delete params.importTime;
    }
    // 派单时间范围处理
    if(params.sendTime) {
      let dateList = params.sendTime.split(',');
      if(dateList.length === 4) {
      // let [startDate, endDate] = param.sendTime.split(',');
        params.startSendTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
        params.endSendTime =  dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
      }
        delete params.sendTime;
    }
    return new Promise((resolve,reject) => {
      defHttp.get({ url: Api.list, params}).then(res => {
        res.records = res.list;
        delete res.list;
        resolve(res);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    })
};

/**
 * 批量转出工单
 */
export const forwardTicketBatch = (params) => defHttp.post({ url: Api.forwardTicketBatch, data: qs.stringify(params) , headers: {'content-type': ContentTypeEnum.FORM_URLENCODED}},);

/**
 * 转出工单
 */
export const forwardTicket = (params) => {
  console.log(params);
  if(params.forwardType === 'city') {
     return defHttp.post({ url: Api.forwardTicketToCity, data: params, headers: {'content-type': ContentTypeEnum.FORM_URLENCODED} });
  } else {
     return defHttp.post({ url: Api.forwardTicketToDistrict, data: params, headers: {'content-type': ContentTypeEnum.FORM_URLENCODED} });
  }
};

/**
 * 获取工单详情
 */
export const getTicketInfoInTurnOut = (params) => defHttp.get({ url: Api.getTicketInfo, params });

