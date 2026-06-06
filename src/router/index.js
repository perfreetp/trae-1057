import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '苗床总览', icon: 'DataBoard' }
      },
      {
        path: 'batches',
        name: 'Batches',
        component: () => import('@/views/Batches.vue'),
        meta: { title: '批次档案', icon: 'Document' }
      },
      {
        path: 'sowing',
        name: 'Sowing',
        component: () => import('@/views/Sowing.vue'),
        meta: { title: '播种移栽', icon: 'Suitcase' }
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/Maintenance.vue'),
        meta: { title: '灌溉施肥', icon: 'Watermelon' }
      },
      {
        path: 'diseases',
        name: 'Diseases',
        component: () => import('@/views/Diseases.vue'),
        meta: { title: '病害处理', icon: 'Warning' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/Inventory.vue'),
        meta: { title: '出入库', icon: 'Box' }
      },
      {
        path: 'allocation',
        name: 'Allocation',
        component: () => import('@/views/Allocation.vue'),
        meta: { title: '调拨领用', icon: 'Van' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { title: '盘点报表', icon: 'DataLine' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
