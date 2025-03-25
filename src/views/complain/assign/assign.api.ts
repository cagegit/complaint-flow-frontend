import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';
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
    // 导入时间范围处理
    if(params.importTime) {
      let dateList = params.importTime.split(',');
      if(dateList.length === 4) {
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
        params.startSendTime = dayjs(dateList[0] + dateList[1]).format('YYYY-MM-DD HH:mm:ss');
        params.endSendTime =  dayjs(dateList[2] + dateList[3]).format('YYYY-MM-DD HH:mm:ss');
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
