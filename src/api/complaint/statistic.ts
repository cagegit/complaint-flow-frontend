import { defHttp } from '/@/utils/http/axios';

const Api = {
  // 月度周期
  getTimeCycle: '/complain/timeCycle/getTimeCycle',
  // 年度周期
  getYearCycle: '/complain/timeCycle/getYearCycle',
  // 总览
  getOverviewCount: '/complain/statistic/getOverviewCount',
  // 满意度
  getSatisfyRate: '/complain/statistic/getSatisfyRate',
  // 案件轮动
  getAssignPageList: '/complain/statistic/getAssignPageList',
  // 案件类型统计
  getQuestionTypeCountList: '/complain/statistic/getQuestionTypeCountList',
  // 案件性质分类
  getCaseNatureCount: '/complain/statistic/getCaseNatureCount',
  // 排名
  getDeptRankList: '/complain/statistic/getDeptRankList',
  // 诉件统计
  getOrderLineCountList: '/complain/statistic/getOrderLineCountList',
  // 诉讼类型分析统计
  getCaseCategoryList: '/complain/statistic/getCaseCategoryList',
  // 双否分析
  getDoubleNoList: '/complain/statistic/getDoubleNoList',
  // 群诉案件分析
  getQunsuList: '/complain/statistic/getQunsuList',
};
export const getTimeCycle = () => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getTimeCycle }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getYearCycle = () => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getYearCycle }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getOverviewCount = () => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getOverviewCount }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getSatisfyRate = (params?) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getSatisfyRate, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getAssignPageList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getAssignPageList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};

export const getQuestionTypeCountList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getQuestionTypeCountList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getCaseNatureCount = (params?) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getCaseNatureCount, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};

export const getDeptRankList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getDeptRankList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getOrderLineCountList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getOrderLineCountList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getCaseCategoryList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getCaseCategoryList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getDoubleNoList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getDoubleNoList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
export const getQunsuList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.getQunsuList, params }, { successMessageMode: 'none' }).then((res) => {
      resolve(res);
    });
  });
};
