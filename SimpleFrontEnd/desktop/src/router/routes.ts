import { RouteRecordRaw } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/:access_token',
    component: () => import('components/CallbackComponent.vue')

  },

  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
      // other app routes go here
    ]
  }
]


export default routes;
