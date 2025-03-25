import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';

export enum Api {
  // 获取工单列表
  list = '/complain/receive/getReceiveList',
  // 添加工单
  addTicket = '/complain/receive/addComplain',
  // 编辑工单
  editTicket = '/complain/receive/editComplain',
  // 通过id删除工单
  deleteTicket = '/complain/receive/deleteComplain',
  // 批量删除工单
  deleteBatchTicket = '/complain/receive/deleteBatch',
  // 获取工单详情
  getTicketInfo = '/complain/receive/queryById',
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
 * 添加工单
 */
export const addTicket = (params) => defHttp.post({ url: Api.addTicket, params , headers: {ContentType: ContentTypeEnum.FORM_URLENCODED}},);

/**
 * 编辑工单
 */
export const editTicket = (params) => defHttp.post({ url: Api.editTicket, params, headers: {ContentType: ContentTypeEnum.FORM_URLENCODED} });

/**
 * 通过id删除工单
 */
export const deleteTicket = (params) => defHttp.post({ url: Api.deleteTicket, params, headers: {ContentType: ContentTypeEnum.FORM_URLENCODED} });

/**
 * 批量删除工单
 */
export const deleteBatchTicket = (params) => defHttp.post({ url: Api.deleteBatchTicket, params, headers: {ContentType: ContentTypeEnum.FORM_URLENCODED} });

/**
 * 获取工单详情
 */
export const getTicketInfo = (params) => defHttp.get({ url: Api.getTicketInfo, params });

