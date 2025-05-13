import { defHttp } from '/@/utils/http/axios';


export enum Api {
    // 来电记录
    list = '/complain/assign/getPhoneOrderList',
    // 获取联系记录详情
    getDetail = '/complain/contactHistory/getDetail',
}
// 获取联系记录列表
export const list = (params) => {
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
}
// 获取联系记录详情
export const getContactHistoryDetail = (params) => {
    return defHttp.get({ url: Api.getDetail, params });
}