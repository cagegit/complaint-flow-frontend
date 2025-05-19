import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum, paramsToQuery } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';

export enum Api {
  // 获取列表
  list = '/complain/monitor/getPageList',
  // 保存周期
  saveCycle = '/complain/timeCycle/saveCycle',
  // 编辑
  editPriority = '/complain/monitor/editMonitorPeople',
  // 通过id删除
  deletePriority = '/complain/monitor/delete',
  // 批量删除
  deleteBatchPriority = '/complain/monitor/deleteBatch',
  // 获取工单详情
  getPriorityInfo = '/complain/monitor/queryById',
}
/**
 * 已接收列表
 */
export const list = (param) => {
  const params: any = pageNoToPageNum(param);
  console.log(params);
  return new Promise((resolve, reject) => {
    defHttp.get({ url: Api.list, params }).then(res => {
      res.records = res.list;
      console.log('重点', res.list);
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
export const saveCycle = (params) => defHttp.post({ url: Api.saveCycle, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

/**
 * 编辑工单
 */
export const editPriority = (params) => defHttp.post({ url: Api.editPriority, params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

/**
 * 通过id删除工单
 */
export const deletePriority = (params) => defHttp.post({ url: paramsToQuery(Api.deletePriority, params), params, headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

/**
 * 批量删除工单
 */
export const deleteBatchPriority = (params) => defHttp.post({ url: paramsToQuery(Api.deleteBatchPriority, params), headers: { ContentType: ContentTypeEnum.FORM_URLENCODED } });

/**
 * 获取工单详情
 */
export const getPriorityInfo = (params) => defHttp.get({ url: Api.getPriorityInfo, params });

