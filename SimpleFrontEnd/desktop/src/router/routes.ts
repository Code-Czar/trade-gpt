import { RouteRecordRaw } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ],
    meta: { requiresAuth: false, roles: [] }
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Public/LoginPage.vue') }
    ],
    meta: { requiresAuth: false, roles: [] }

  },
  {
    path: '/auth',
    component: () => import('components/CallbackComponent.vue'),
    meta: { requiresAuth: false, roles: [] }

  },
  {
    path: '/:access_token',
    component: () => import('components/CallbackComponent.vue'),
    meta: { requiresAuth: false, roles: [] }

  },
  {
    path: '/checkout',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Public/CheckoutPage.vue') }
    ],
    meta: { requiresAuth: true, permissionLevel: [], roles: ['Admin', 'Dev'] }
  },
  {
    path: '/monitoring',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MonitoringPage.vue') }
    ]
  },
  {
    path: '/premiumAlerts',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Private/VIP_Pages/AlertsPage.vue') }
    ],
    meta: { requiresAuth: true, permissionLevel: [], roles: ['Dev', 'Advanced'] }
  },
  {
    path: '/devOnly',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Private/DevOnly.vue') }
    ],
    meta: { requiresAuth: true, permissionLevel: [], roles: ['Dev'] }
  },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Private/RSIPage.vue') }

      // other app routes go here
    ],
    meta: { requiresAuth: true, permissionLevel: [], roles: ['Admin', 'Dev', 'BetaTester'] }
  },
  {
    path: '/beta',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Public/BetaTester/betaTesterNotice.vue') }

      // other app routes go here
    ],
    meta: { requiresAuth: true, permissionLevel: [], roles: ['User'] }
  },
  {
    path: '/unauthorized',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Public/UnauthorizedPage.vue') }

      // other app routes go here
    ],
    meta: { requiresAuth: false, permissionLevel: [], roles: [] }
  }
]


export default routes;
