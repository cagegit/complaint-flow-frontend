import { ContentTypeEnum } from '/@/enums/httpEnum';
import { defHttp } from '/@/utils/http/axios';

export enum Api {
  // 保存周期
  saveCycle = '/complain/timeCycle/saveCycle',
  // 获取详情
  getConfig = '/complain/timeCycle/getConfig',
}


/**
 * 添加工单
 */
export const saveCycle = (params) => defHttp.post({ url: Api.saveCycle, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

export const getConfig = () => defHttp.get({ url: Api.getConfig });

