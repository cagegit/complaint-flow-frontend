import type { AppRouteRecordRaw } from '/@/router/types';
import { H5_LAYOUT } from '/@/router/constant';
// 移动端，分派h5路由
export const AssignRouter: AppRouteRecordRaw = {
  path: '/h5-assign',
  name: 'H5Assign',
  component: H5_LAYOUT,
  redirect: '/h5-assign/index',
  meta: {
    title: 'H5Assign',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5AssignIndex',
      component: () => import('/@/views/h5/assign/index.vue'),
      meta: {
        title: '工单分配',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-assign',
      },
    },
    {
      path: 'detail',
      name: 'H5AssignDetail',
      component: () => import('/@/views/h5/assign/detail.vue'),
      meta: {
        title: '工单分配详情',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-assign',
      },
    },
  ],
};

// 移动端h5路由列表
export const mobileH5RoutesList = [AssignRouter];
