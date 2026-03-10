import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

/*
|--------------------------------------------------------------------------
| Routes — BeTalent Payment API
|--------------------------------------------------------------------------
| Prefixo base: /api/v1
|
| Rotas Públicas:
|   POST  /api/v1/auth/login
|   POST  /api/v1/purchase
|
| Rotas Privadas (requerem Bearer token):
|   POST   /api/v1/auth/logout
|   GET    /api/v1/users            [ADMIN]
|   POST   /api/v1/users            [ADMIN]
|   GET    /api/v1/users/:id        [ADMIN]
|   PUT    /api/v1/users/:id        [ADMIN]
|   DELETE /api/v1/users/:id        [ADMIN]
|   GET    /api/v1/products         [ADMIN, MANAGER, FINANCE]
|   POST   /api/v1/products         [ADMIN, MANAGER]
|   GET    /api/v1/products/:id     [ADMIN, MANAGER, FINANCE]
|   PUT    /api/v1/products/:id     [ADMIN, MANAGER]
|   DELETE /api/v1/products/:id     [ADMIN, MANAGER]
|   GET    /api/v1/clients          [all authenticated]
|   GET    /api/v1/clients/:id      [all authenticated]
|   GET    /api/v1/transactions     [all authenticated]
|   GET    /api/v1/transactions/:id [all authenticated]
|   POST   /api/v1/transactions/:id/refund [ADMIN, FINANCE]
|   GET    /api/v1/gateways         [ADMIN]
|   PATCH  /api/v1/gateways/:id/toggle   [ADMIN]
|   PATCH  /api/v1/gateways/:id/priority [ADMIN]
*/

router.group(() => {

  // ─── Auth ────────────────────────────────────────────────────────────
  router.group(() => {
    router.post('login', '#controllers/auth_controller.login')
    router.post('logout', '#controllers/auth_controller.logout').use(middleware.auth())
  }).prefix('auth')

  // ─── Purchase (public) ───────────────────────────────────────────────
  router.post('purchase', '#controllers/purchases_controller.store')

  // ─── Users (ADMIN only) ──────────────────────────────────────────────
  router.group(() => {
    router.get('/', '#controllers/users_controller.index')
    router.post('/', '#controllers/users_controller.store')
    router.get('/:id', '#controllers/users_controller.show')
    router.put('/:id', '#controllers/users_controller.update')
    router.delete('/:id', '#controllers/users_controller.destroy')
  })
    .prefix('users')
    .use([middleware.auth(), middleware.role({ roles: ['ADMIN'] })])

  // ─── Products ────────────────────────────────────────────────────────
  router.group(() => {
    // List and view: ADMIN, MANAGER, FINANCE
    router.get('/', '#controllers/products_controller.index')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'MANAGER', 'FINANCE'] })])
    router.get('/:id', '#controllers/products_controller.show')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'MANAGER', 'FINANCE'] })])

    // Create, update, delete: ADMIN, MANAGER
    router.post('/', '#controllers/products_controller.store')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'MANAGER'] })])
    router.put('/:id', '#controllers/products_controller.update')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'MANAGER'] })])
    router.delete('/:id', '#controllers/products_controller.destroy')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'MANAGER'] })])
  }).prefix('products')

  // ─── Clients (all authenticated) ─────────────────────────────────────
  router.group(() => {
    router.get('/', '#controllers/clients_controller.index')
    router.get('/:id', '#controllers/clients_controller.show')
  })
    .prefix('clients')
    .use(middleware.auth())

  // ─── Transactions ─────────────────────────────────────────────────────
  router.group(() => {
    // List and detail: all authenticated
    router.get('/', '#controllers/transactions_controller.index')
      .use(middleware.auth())
    router.get('/:id', '#controllers/transactions_controller.show')
      .use(middleware.auth())

    // Refund: ADMIN, FINANCE
    router.post('/:id/refund', '#controllers/transactions_controller.refund')
      .use([middleware.auth(), middleware.role({ roles: ['ADMIN', 'FINANCE'] })])
  }).prefix('transactions')

  // ─── Gateways (ADMIN only) ────────────────────────────────────────────
  router.group(() => {
    router.get('/', '#controllers/gateways_controller.index')
    router.patch('/:id/toggle', '#controllers/gateways_controller.toggle')
    router.patch('/:id/priority', '#controllers/gateways_controller.updatePriority')
  })
    .prefix('gateways')
    .use([middleware.auth(), middleware.role({ roles: ['ADMIN'] })])

}).prefix('/api/v1')
