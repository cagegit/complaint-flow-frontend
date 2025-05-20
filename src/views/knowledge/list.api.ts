import { pageNoToPageNum } from '/@/utils';
import { defHttp } from '/@/utils/http/axios';
import dayjs from 'dayjs';
export enum Api {
  // 知识库列表
  list = '/complain/assign/getAssignPageList',
  // 保存知识库
  addKnowledge = '/complain/assign/addKnowledge',
  // 编辑知识库
  editKnowledge = '/complain/assign/editKnowledge',
 // 删除知识库
  deleteKnowledge = '/complain/assign/deleteKnowledge',
  // 知识库详情
  getKnowledgeDetail = '/complain/assign/getKnowledgeDetail',
}

/**
 * 知识库列表
 */
export const getKnowledgeList = (params) => {
//   return defHttp.get({ url: Api.list, params });
  return Promise.resolve({
    data: []
    });
};

/**
 * 保存知识库
 */
export const addKnowledge = (params) => {
  return defHttp.post({ url: Api.addKnowledge, data: params });
};
/**
 * 编辑知识库
 */
export const editKnowledge = (params) => {
  return defHttp.post({ url: Api.editKnowledge, data: params });
}

/**
 * 删除知识库
 */
export const deleteKnowledge = (params) => {
  return defHttp.post({ url: Api.deleteKnowledge, data: params });
}

/**
 * 知识库详情
 */
export const getKnowledgeDetail = (params) => {
  return defHttp.get({ url: Api.getKnowledgeDetail, params });
}