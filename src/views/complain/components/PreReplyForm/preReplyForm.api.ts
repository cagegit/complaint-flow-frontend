import { ContentTypeEnum } from '/@/enums/httpEnum';
import { defHttp } from '/@/utils/http/axios';


export enum Api {
  // 获取回复详情
  getReplyDetail = '/complain/upReply/getUpReplyDetail',
  // 保存回复
  saveReply = '/complain/upReply/saveUpReply'
}
// 保存预回复表单
export const savePreReply = (params) => {
  return defHttp.post({ url: Api.saveReply, params });
};

// 获取预回复详情
export const getPreReplyDetail = (params) => {
  return defHttp.get({ url: Api.getReplyDetail, params });
};