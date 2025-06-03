/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '/@/router/types';
// test
// http:ip:port/main-out
export const mainOutRoutes: AppRouteModule[] = [
  {
    path: '/main-out',
    name: 'MainOut',
    component: () => import('/@/views/demo/main-out/index.vue'),
    meta: {
      title: 'MainOut',
      ignoreAuth: true,
    },
  },
  {
    path: '/runtime',
    name: 'runtime',
    component: () => import('/@/views/runtime/index.vue'),
    meta: {
      title: '城北街道诉求管理平台',
      ignoreAuth: true,
      hideTab: true,
    },
  },
  {
    path: '/composite',
    name: 'composite',
    component: () => import('/@/views/composite/index.vue'),
    meta: {
      title: '城北街道诉求管理平台',
      ignoreAuth: true,
      hideTab: true,
      hideMenu: true,
    },
  },
];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
