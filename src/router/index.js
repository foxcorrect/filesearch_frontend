import Vue from 'vue';
import Router from 'vue-router';
import { getToken, removeToken } from '@/utils/storage';

Vue.use(Router);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'ResumeList',
          component: () => import('@/views/ResumeList.vue'),
        },
        {
          path: 'upload',
          name: 'ResumeUpload',
          component: () => import('@/views/ResumeUpload.vue'),
        },
        {
          path: 'resume/:id',
          name: 'ResumeDetail',
          component: () => import('@/views/ResumeDetail.vue'),
        },
      ],
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = getToken();
  const expired = token && isTokenExpired(token);
  if (expired) removeToken();
  const isLoggedIn = !!token && !expired;
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
