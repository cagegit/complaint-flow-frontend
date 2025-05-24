import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';
export enum Api {
  // 获取回复列表
  list = '/complain/reply/getReplyPageList',
  // 获取回复详情
  getReplyDetail = '/complain/reply/getReplyDetail',
  // 保存回复
  saveReply = '/complain/reply/saveReply',
  // 确认回复
  confirmReply = '/complain/reply/confirmReply',
  //社区回复
  saveSubmitReply = '/complain/reply/submitReply',
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
        params.startImportTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD') + ' 00:00:00';
        params.endImportTime = dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD') + ' 23:59:59';
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
  return defHttp.get({ url: Api.getReplyDetail, params: param})
}

/**
 * 保存回复
 */
export const saveReply = (param) => {
  return defHttp.post({ url: Api.saveReply, params: param})
}

/**
 * 社区回复
 */
export const saveSubmitReply = (param) => {
  return defHttp.post({ url: Api.saveSubmitReply, params: param})
}
/**
 * 确认回复
 */
export const confirmReply = (param) => {
  return defHttp.post({ url: Api.confirmReply, params: param})
}

/**
 * 增加部门回复内容
 * 参数示例
* {
*   "addFileList": [
*     {
*       "assignId": 0,
*       "fileKey": "",
*       "id": 0,
*       "remark": "",
*       "type": 0
*     }
*   ],
*   "assignId": 0,
*   "deleteFileIdList": [],
*   "overseeUserName": "",
*   "overseeUserPhone": "",
*   "remark": "",
*   "replyAudioDuration": 0,
*   "replyAudioNote": "",
*   "resolveResult": ""
* }
 * @param params
 */
export const addDepartReply = (params) => {
  return defHttp.post({ url: Api.saveReply, data: params });
}

