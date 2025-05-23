import { ContentTypeEnum } from '/@/enums/httpEnum';
import { defHttp } from '/@/utils/http/axios';

const Api = {
  getPageList: '/biz/knowledgeLib/getPageList',
  saveKnowledge: '/biz/knowledgeLib/saveKnowledge',
  deleteKnowledge: '/biz/knowledgeLib/deleteKnowledge',
  getDetail: '/biz/knowledgeLib/getDetail',
  getOptionTextList: '/biz/knowledgeLib/getOptionTextList',
  getDeptList: '/biz/knowledgeLib/getDeptList',
};
// 获取列表
export const getPageList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getPageList, params }).then((res) => {
      res.records = res.list;
      delete res.list;
      resolve(res);
    });
  });
};
// 新增
export const saveKnowledge = (params) => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.saveKnowledge, params }).then((res) => {
      resolve(res);
    });
  });
};
// 删除
export const deleteKnowledge = (params) => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.deleteKnowledge, params, headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED } }).then((res) => {
      resolve(res);
    });
  });
};
// 获取详情
export const getDetail = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getDetail, data:params, headers: { 'content-type': ContentTypeEnum.FORM_URLENCODED } }).then((res) => {
      resolve(res);
    });
  });
};
// 获取选项文本列表
export const getOptionTextList = () => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getOptionTextList }).then((res) => {
      resolve(res);
    });
  });
};
// 获取部门列表
export const getDeptList = () => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getDeptList }).then((res) => {
      resolve(res);
    });
  });
};
