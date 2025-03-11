import { defHttp } from '/@/utils/http/axios';

const Api = {
  getReceiveList: '/complain/receive/getReceiveList',
  addComplain: '/complain/receive/addComplain',
  editComplain: '/complain/receive/editComplain',
  deleteComplain: '/complain/receive/deleteComplain',
  deleteBatch: '/complain/receive/deleteBatch',
};
// 获取列表
export const getComplaintList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getReceiveList, params }).then((res) => {
      resolve(res);
    });
  });
};
// 新增
export const createComplaint = (params) => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.addComplain, params }).then((res) => {
      resolve(res);
    });
  });
};
// 编辑
export const updateComplaint = (params) => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.editComplain, params }).then((res) => {
      resolve(res);
    });
  });
};
// 删除
export const deleteComplaint = (id: string) => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.deleteComplain, params: { id } }).then((res) => {
      resolve(res);
    });
  });
};
// 批量删除
export const deleteBatch = () => {
  return new Promise((resolve) => {
    defHttp.post({ url: Api.deleteBatch }).then((res) => {
      resolve(res);
    });
  });
};
