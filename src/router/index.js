import Vue from 'vue';
import Router from 'vue-router';
import { getToken } from '@/utils/storage';

Vue.use(Router);

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
      ],
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = !!getToken();
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
