/**
 * 路由：hash 模式，便于静态部署。
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/detail' },
    {
      path: '/detail',
      name: 'detail',
      component: () => import('@/components/detail/DetailView.vue'),
    },
    {
      path: '/table',
      name: 'table',
      component: () => import('@/components/table/WeaponTable.vue'),
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('@/components/compare/CompareView.vue'),
    },
  ],
})

export default router
