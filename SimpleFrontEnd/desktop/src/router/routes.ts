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
      { path: '', component: () => import('pages/LoginPage.vue') }
    ],
    meta: { requiresAuth: false, roles: [] }

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
      { path: '', component: () => import('pages/VIP_Pages/AlertsPage.vue') }
    ],
    meta: { requiresAuth: true, roles: ['Dev', 'VIP', 'Advanced'] }
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
    path: '/checkout',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CheckoutPage.vue') }
    ],
    meta: { requiresAuth: true, roles: ['Admin', 'VIP', 'Dev'] }
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
