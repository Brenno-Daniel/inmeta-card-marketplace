import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('src/modules/marketplace/views/MarketplacePage.vue'),
      },
      {
        path: 'inventory',
        component: () =>
          import('src/modules/inventory/views/InventoryPage.vue'),
      },
      {
        path: 'trade',
        component: () => import('src/modules/trade/views/TradePage.vue'),
      },
      {
        path: 'active-trades',
        component: () =>
          import('src/modules/trade/views/ActiveTradesPage.vue'),
      },
    ],
  },

  {
    path: '/auth',
    component: () => import('src/modules/auth/views/AuthPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
