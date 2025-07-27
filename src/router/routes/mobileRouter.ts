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
    {
      path: 'resign',
      name: 'H5AssignResign',
      component: () => import('/@/views/h5/assign/resign.vue'),
      meta: {
        title: '工单转出',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-assign',
      },
    },
  ],
};

export const ReplyRouter: AppRouteRecordRaw = {
  path: '/h5-reply',
  name: 'H5Reply',
  component: H5_LAYOUT,
  redirect: '/h5-reply/index',
  meta: {
    title: 'H5Reply',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5ReplyIndex',
      component: () => import('/@/views/h5/depart-replay/index.vue'),
      meta: {
        title: '工单回复',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-reply',
      },
    },
    {
      path: 'resign',
      name: 'H5ReplyResign',
      component: () => import('/@/views/h5/depart-replay/resign.vue'),
      meta: {
        title: '工单回复-重新分派',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-reply',
      },
    },
  ],
};

export const FollowRouter: AppRouteRecordRaw = {
  path: '/h5-follow',
  name: 'H5Follow',
  component: H5_LAYOUT,
  redirect: '/h5-follow/index',
  meta: {
    title: 'H5Follow',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5FollowIndex',
      component: () => import('/@/views/h5/follow/index.vue'),
      meta: {
        title: '工单回访',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-follow',
      },
    },
  ],
};

export const AuditRouter: AppRouteRecordRaw = {
  path: '/h5-audit',
  name: 'H5Audit',
  component: H5_LAYOUT,
  redirect: '/h5-audit/index',
  meta: {
    title: 'H5Audit',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5AuditIndex',
      component: () => import('/@/views/h5/need-completion/index.vue'),
      meta: {
        title: '工单审核',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-audit',
      },
    },
  ],
};

export const LoginRouter: AppRouteRecordRaw = {
  path: '/h5-login',
  name: 'H5Login',
  component: H5_LAYOUT,
  redirect: '/h5-login/index',
  meta: {
    title: 'H5Login',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5LoginIndex',
      component: () => import('/@/views/sys/login/TokenLoginH5Page.vue'),
      meta: {
        title: '登录',
        hideBreadcrumb: true,
        ignoreAuth: true,
        currentActiveMenu: '/h5-login',
      },
    },
  ],
};

export const ReviewReplyRouter: AppRouteRecordRaw = {
  path: '/h5-review-reply',
  name: 'H5ReviewReply',
  component: H5_LAYOUT,
  redirect: '/h5-review-reply/index',
  meta: {
    title: 'H5ReviewReply',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5ReviewReplyIndex',
      component: () => import('/@/views/h5/review-reply/index.vue'),
      meta: {
        title: '回复审核',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-review-reply',
      },
    },
  ],
};

export const FollowAuditRouter: AppRouteRecordRaw = {
  path: '/h5-follow-audit',
  name: 'H5FollowAudit',
  component: H5_LAYOUT,
  redirect: '/h5-follow-audit/index',
  meta: {
    title: 'H5FollowAudit',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5FollowAuditIndex',
      component: () => import('/@/views/h5/follow-audit/index.vue'),
      meta: {
        title: '回访审核',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-follow-audit',
      },
    },
  ],
};

export const CompletionRouter: AppRouteRecordRaw = {
  path: '/h5-completion',
  name: 'H5Completion',
  component: H5_LAYOUT,
  redirect: '/h5-completion/index',
  meta: {
    title: 'H5Completion',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'H5CompletionIndex',
      component: () => import('/@/views/h5/completion/index.vue'),
      meta: {
        title: '回访审核',
        hideBreadcrumb: true,
        currentActiveMenu: '/h5-completion',
      },
    },
  ],
};

// 移动端h5路由列表
export const mobileH5RoutesList = [
  LoginRouter,
  AssignRouter,
  ReplyRouter,
  FollowRouter,
  AuditRouter,
  ReviewReplyRouter,
  FollowAuditRouter,
  CompletionRouter,
];
