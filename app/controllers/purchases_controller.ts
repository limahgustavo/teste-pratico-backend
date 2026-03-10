import type { HttpContext } from '@adonisjs/core/http'
import PaymentService from '#services/payment_service'
import { purchaseValidator } from '#validators/purchase_validator'
import type { PurchaseItem } from '#dtos/purchase_dto'

/**
 * PurchasesController - processa compras (rota pública)
 */
export default class PurchasesController {
    /**
     * POST /api/v1/purchase
     * Rota pública — qualquer pessoa pode comprar
     */
    async store({ request, response }: HttpContext) {
        const data = await request.validateUsing(purchaseValidator)

        const paymentService = new PaymentService()

        const transaction = await paymentService.purchase({
            client: data.client,
            products: data.products as PurchaseItem[],
            card: data.card,
        })

        return response.created({
            data: {
                transactionId: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                gateway: transaction.gateway?.name,
                cardLastNumbers: transaction.cardLastNumbers,
                client: {
                    id: transaction.client?.id,
                    name: transaction.client?.name,
                    email: transaction.client?.email,
                },
                products: transaction.products?.map((p) => ({
                    id: p.id,
                    name: p.name,
                    quantity: (p.$extras as Record<string, unknown>)['pivot_quantity'],
                    unitAmount: (p.$extras as Record<string, unknown>)['pivot_unit_amount'],
                })),
            },
            message: 'Purchase completed successfully',
        })
    }
}
