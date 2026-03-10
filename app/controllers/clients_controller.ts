import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'

/**
 * ClientsController - listagem e detalhe de clientes com suas compras
 * Acesso: qualquer usuário autenticado
 */
export default class ClientsController {
    /** GET /api/v1/clients */
    async index({ response }: HttpContext) {
        const clients = await Client.query().orderBy('name', 'asc')
        return response.ok({ data: clients, message: 'Clients retrieved successfully' })
    }

    /** GET /api/v1/clients/:id — inclui todas as compras do cliente */
    async show({ params, response }: HttpContext) {
        const client = await Client.query()
            .where('id', params.id)
            .preload('transactions', (q) => {
                q.preload('gateway').preload('products').orderBy('created_at', 'desc')
            })
            .firstOrFail()

        return response.ok({ data: client, message: 'Client retrieved successfully' })
    }
}
