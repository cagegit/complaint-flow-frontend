import { defHttp } from '/@/utils/http/axios';


export enum Api {
    // 获取联系记录列表
    list = '/complain/contactHistory/list',
    // 获取联系记录详情
    getDetail = '/complain/contactHistory/getDetail',
}
// 获取联系记录列表
export const list = (params) => {
    return defHttp.get({ url: Api.list, params });
}
// 获取联系记录详情
export const getContactHistoryDetail = (params) => {
    return defHttp.get({ url: Api.getDetail, params });
}