import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';

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
    return defHttp.get({ url: Api.list, params})
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

