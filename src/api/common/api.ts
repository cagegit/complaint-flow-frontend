import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
enum Api {
  positionList = '/sys/position/list',
  userList = '/sys/user/list',
  roleList = '/sys/role/list',
  queryDepartTreeSync = '/sys/sysDepart/queryDepartTreeSync',
  queryTreeList = '/sys/sysDepart/queryTreeList',
  loadTreeData = '/sys/category/loadTreeData',
  loadDictItem = '/sys/category/loadDictItem/',
  getDictItems = '/sys/dict/getDictItems/',
  getTableList = '/sys/user/queryUserComponentData',
  getCategoryData = '/sys/category/loadAllData',
  // 修改回复解决情况
  editReplyStatus = '/complain/reply/editResolve'
}

/**
 * 上传父路径
 */
export const uploadUrl = `${baseUploadUrl}/sys/common/upload`;

/**
 * 职务列表
 * @param params
 */
export const getPositionList = (params) => {
  return defHttp.get({ url: Api.positionList, params });
};

/**
 * 用户列表
 * @param params
 */
export const getUserList = (params) => {
  return defHttp.get({ url: Api.userList, params });
};

/**
 * 角色列表
 * @param params
 */
export const getRoleList = (params) => {
  return defHttp.get({ url: Api.roleList, params });
};

/**
 * 异步获取部门树列表
 */
export const queryDepartTreeSync = (params?) => {
  return defHttp.get({ url: Api.queryDepartTreeSync, params });
};
/**
 * 获取部门树列表
 */
export const queryTreeList = (params?) => {
  return defHttp.get({ url: Api.queryTreeList, params });
};

/**
 * 分类字典树控件 加载节点
 */
export const loadTreeData = (params?) => {
  return defHttp.get({ url: Api.loadTreeData, params });
};

/**
 * 根据字典code加载字典text
 */
export const loadDictItem = (params?) => {
  return defHttp.get({ url: Api.loadDictItem, params });
};

/**
 * 根据字典code加载字典text
 */
export const getDictItems = (dictCode) => {
  return defHttp.get({ url: Api.getDictItems + dictCode }, { joinTime: false });
};
/**
 * 部门用户modal选择列表加载list
 */
export const getTableList = (params) => {
  return defHttp.get({ url: Api.getTableList, params });
};
/**
 * 加载全部分类字典数据
 */
export const loadCategoryData = (params) => {
  return defHttp.get({ url: Api.getCategoryData, params });
};
/**
 * 文件上传
 */
export const uploadFile = (params, success) => {
  return defHttp.uploadFile({ url: uploadUrl }, params, { success });
};

/**
 * 接诉文件上传-新返回结构
 */
export const uploadJsFile = (params, success) => {
  return new Promise((resolve, reject) => {
    defHttp.uploadFile({ url: uploadUrl }, params, { success })
      .then(({result, ...rest}) => {
        resolve({
          url: result || '',
          ...rest,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
/**
 * 下载文件
 * @param url 文件路径
 * @param fileName 文件名
 * @param parameter
 * @returns {*}
 */
export const downloadFile = (url, fileName?, parameter?) => {
  return getFileblob(url, parameter).then((data) => {
    if (!data || data.size === 0) {
      message.warning('文件下载失败');
      return;
    }
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      window.navigator.msSaveBlob(new Blob([data]), fileName);
    } else {
      let url = window.URL.createObjectURL(new Blob([data]));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    }
  });
};

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export const getFileblob = (url, parameter) => {
  return defHttp.get(
    {
      url: url,
      params: parameter,
      responseType: 'blob',
    },
    { isTransformResponse: false }
  );
};

/**
 * 【用于评论功能】自定义文件上传-方法
 */
export const uploadMyFile = (url, data) => {
  return defHttp.uploadMyFile(url, data);
};


// 管区接口（原社区）
export const getCommunityList = (categoryId:string) => {
  return defHttp.get({ url: '/biz/depart/getLevelTwoList' + `?orgCategory=${categoryId}` });
};
// 社区（原居委会）
export const getCommunityChildList = (parentId:string) => {
  return defHttp.get({ url: '/biz/depart/getChildList' + `?parentId=${parentId}`, });
};

// 获取二级树形
export const getSecondTreeList = (orgCategory:string) => {
  return defHttp.get({ url: '/biz/depart/getLevelTwoTree' + `?orgCategory=${orgCategory}` });
};
// 七有无性树形列表
export const getQywxTreeList = () => {
  return defHttp.get({ url: '/biz/sevenFive/getList' });
};
// 刷新组织机构缓存
export const refreshDepartCache = () => {
  return defHttp.get({ url: '/biz/depart/refreshDepartCache' + `?random=`+ Date.now() });
};
// 获取区级全部基础字典
export const getAllDistrictDict = () => {
  return defHttp.get({ url: '/biz/upDict/getAllBaseDict' });
};
// 获取区级基础字典
export const getDistrictDictByCode = (dictCode:string) => {
  return defHttp.get({ url: '/biz/upDict/getBaseDictList?dictType=' + dictCode });
};

/**
 * 社区/村列表
 * 
 * @param params
 * @returns {name: string, id: string}[]
 */
export const getCommunityListByCode = () => {
  return defHttp.get({ url: '/biz/upDict/getCommunityOfficeList' });
};

/**
 * 市问题分类列表
 * 
 * @param params
 * @returns {name: string, id: string, remark: string}[]
 */
export const getCityQuestionCategoryList = () => {
  return defHttp.get({ url: '/biz/upDict/getProblemCategoryList' });
};
/**
 * 吹哨部门列表
 * 
 * @param params
 * @returns {name: string, id: string, parentId:string, remark: string}[]
 */
export const getWhistleDepartmentList = () => {
  return defHttp.get({ url: '/biz/upDict/getWhistleDepartmentList' });
};
/**
 * 最终处置部门列表
 *
 * @param params
 * @returns {name: string, id: string, parentId:string, remark: string}[]
 */
export const getDisposeDepartmentList = () => {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: '/biz/upDict/getDisposeDepartmentList' })
      .then((res) => {
        // res 数据结构为 id:string, name:string, remark?:string, 有remark的属于部门，没有remark的属于社区/村
        // 有remark的以remark作为key进行分组， 最终结构: 部门包含三级：部门、remark、name, 社区/村包含两级：社区/村、name
        // 最终需要的数据结构 id 、 parentId、name
        // 1. 先将数据分为两类：部门和社区/村
        const departments = res.filter(item => item.remark);
        const communities = res.filter(item => !item.remark);
        
        // 2. 对部门按照remark进行分组
        const departmentGroups = departments.reduce((groups, item) => {
          if (!groups[item.remark]) {
            groups[item.remark] = [];
          }
          groups[item.remark].push(item);
          return groups;
        }, {});
        
        // 3. 构造树形结构
        const result:any[] = [];
        
        // 添加"部门"根节点
        const departmentRoot = {
          id: 'department-root',
          parentId: '0',
          name: '部门'
        };
        result.push(departmentRoot);
        
        // 添加remark作为第二级
        Object.keys(departmentGroups).forEach(remark => {
          const remarkId = `remark-${remark}`;
          result.push({
            id: remarkId,
            parentId: departmentRoot.id,
            name: remark
          });
          
          // 添加具体部门作为第三级
          departmentGroups[remark].forEach(dept => {
            result.push({
              id: dept.id,
              parentId: remarkId,
              name: dept.name
            });
          });
        });
        
        // 添加"社区/村"根节点
        const communityRoot = {
          id: 'community-root',
          parentId: '0',
          name: '社区/村'
        };
        result.push(communityRoot);
        
        // 添加社区/村作为第二级
        communities.forEach(item => {
          result.push({
            id: item.id,
            parentId: communityRoot.id,
            name: item.name
          });
        });
        console.log(result)
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 剔除挂帐类型列表
 * 
 * @param params
 * @returns {name: string, id: string, parentId:string, remark: string}[]
 */
export const getHoldRemoveList = (applyType:string) => {
  return defHttp.get({ url: '/biz/upDict/getHoldRemoveList' + `?gtApplyType=${applyType}` });
};
///biz/upDict/getSevenFiveList
/**
 * 区级七有五性列表
 * 
 * @param params
 * @returns {name: string, id: string, parentId:string, remark: string}[]
 */
export const getCitySevenFiveList = () => {
  return defHttp.get({ url: '/biz/upDict/getSevenFiveList' });
};

/**
 * 工单详情接口
 * 
 * @param params
 */
export const getComplaintDetail = (id: string) => {
  return defHttp.get({ url: `/complain/receive/queryById?id=${id}` });
};
/**
 * 退回单位接口
 * 
 * @param params
 */
export const getBackDepartList = () => {
  return defHttp.get({ url: `/biz/upDict/getBackOfficeList` });
};
// 修改回复状态
export const editReplyYesNoStatus = (params) => {
  return defHttp.post({ url: Api.editReplyStatus, params });
};