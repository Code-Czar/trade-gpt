import { RouteRecordRaw } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/monitoring',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MonitoringPage.vue') }
    ]
  },
  {
    path: '/devOnly',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DevOnly.vue') }
    ],
    meta: { requiresAuth: true, roles: ['Dev'] }
  },
  {
    path: '/:access_token',
    component: () => import('components/CallbackComponent.vue')

  },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RSIPage.vue') }

      // other app routes go here
    ],
    meta: { requiresAuth: true, roles: ['Admin', 'VIP', 'Dev'] }
  }
]


export default routes;
