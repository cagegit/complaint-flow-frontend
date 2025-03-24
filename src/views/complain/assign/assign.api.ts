import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';

export enum Api {
  // 获取工单列表
  list = '/complain/assign/getAssignPageList',
  // 单个分派
  addAssign = '/complain/assign/addAssign',
  // 重新指派
  assignOther = '/complain/assign/assignOther',
  // 分派详情
  getAssignDetail = '/complain/assign/getAssignDetail',
}
/**
 * 分派列表
 */
export const list = (param) => {
    const params:any = pageNoToPageNum(param);
    console.log(params);
    return defHttp.get({ url: Api.list, params})
};


/**
 * 单个分派
 */
export const addAssign = (params) => defHttp.post({ url: Api.addAssign, params});

/**
 * 重新指派
 */
export const assignOther = (params) => defHttp.post({ url: Api.assignOther, params});

/**
 * 分派详情
 */
export const getAssignDetail = (ticketId:string) => defHttp.get({ url: Api.getAssignDetail + '?ticketId='+ticketId});
