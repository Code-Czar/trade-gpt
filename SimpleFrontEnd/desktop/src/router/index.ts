import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteLocationNormalized,
  NavigationGuardNext,
} from 'vue-router';
import routes from './routes';

// Import your user store
// Replace this import with the actual path to your user store
import { userStore } from 'src/stores/userStore';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation Guardw
  Router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore_ = userStore();  // Use your user store
    console.log("🚀 ~ file: router before ~ userStore_:", userStore_.user);
    const isAuthenticated = userStore_.user?.details?.aud === "authenticated" ? true : false;  // Replace with your actual condition to check authentication
    const userRole = userStore_.user?.role;  // User's role, replace with actual logic to get user's role

    console.log("🚀 ~ file: router before ~ to:", to);
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        next({ path: '/login' }); // Redirect to login page if not authenticated
      } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        next({ path: '/unauthorized' }); // Redirect to unauthorized page if user doesn't have the required role
      } else {
        next(); // Proceed to route
      }
    } else {
      next(); // Proceed to route if no auth check is required
    }
    // next();
  });

  return Router;
});
