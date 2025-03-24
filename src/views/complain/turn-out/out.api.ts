import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';

export enum Api {
  // 获取工单列表
  list = '/complain/turnOut/getTurnOutList',
  // 批量转出工单
  forwardTicketBatch = '/complain/turnOut/turnOutBatch',
  // 转出工单
  forwardTicket = '/complain/turnOut/turnOutById'
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
 * 批量转出工单
 */
export const forwardTicketBatch = (params) => defHttp.post({ url: Api.forwardTicketBatch, params , headers: {ContentType: ContentTypeEnum.FORM_URLENCODED}},);

/**
 * 转出工单
 */
export const forwardTicket = (params) => defHttp.post({ url: Api.forwardTicket, params, headers: {ContentType: ContentTypeEnum.FORM_URLENCODED} });

