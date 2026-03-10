import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import PaymentService from '#services/payment_service'

/**
 * TransactionsController - lista, detalhe e reembolso de transações
 */
export default class TransactionsController {
    /** GET /api/v1/transactions */
    async index({ response }: HttpContext) {
        const transactions = await Transaction.query()
            .preload('client')
            .preload('gateway')
            .preload('products')
            .orderBy('created_at', 'desc')

        return response.ok({ data: transactions, message: 'Transactions retrieved successfully' })
    }

    /** GET /api/v1/transactions/:id */
    async show({ params, response }: HttpContext) {
        const transaction = await Transaction.query()
            .where('id', params.id)
            .preload('client')
            .preload('gateway')
            .preload('products')
            .firstOrFail()

        return response.ok({ data: transaction, message: 'Transaction retrieved successfully' })
    }

    /**
     * POST /api/v1/transactions/:id/refund
     * Roles: ADMIN, FINANCE
     */
    async refund({ params, response }: HttpContext) {
        const paymentService = new PaymentService()
        const transaction = await paymentService.refund(Number(params.id))

        return response.ok({
            data: transaction,
            message: 'Refund processed successfully',
        })
    }
}
