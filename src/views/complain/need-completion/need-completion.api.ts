import { ContentTypeEnum } from '/@/enums/httpEnum';
import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';
export enum Api {
  // 获取待区级审核列表
  list = '/complain/upAudit/getCompleteList',
  // 获取待区级审核详情
  getReviewReplyDetail = '/complain/upAudit/getCompleteDetail',
  // 最终回复
  saveReviewReply = '/complain/upAudit/finalReply',
  // 最终驳回
  // confirmReply = '/complain/upAudit/confirmReply',
  confirmReply = '/complain/upAudit/reject',
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
        // params.startImportTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD') + ' 00:00:00';
        // params.endImportTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD') + ' 23:59:59';
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
        params.startSendTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD') + ' 00:00:00';
        params.endSendTime =  dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD') + ' 23:59:59';
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
 * 获取回复详情
 */
export const getReplyDetail = (param) => {
  return defHttp.get({ url: Api.getReviewReplyDetail, params: param})
}

/**
 * 最终回复
 */
export const saveReviewReply = (param) => {
  return defHttp.post({ url: Api.saveReviewReply, data: param})
}

/**
 * 保存审核驳回
 */
export const confirmReply = (param) => {
  return defHttp.post({ url: Api.confirmReply, data: param, headers: {'content-type': ContentTypeEnum.FORM_URLENCODED}})
}
