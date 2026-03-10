import Gateway from '#models/gateway'
import Client from '#models/client'
import Transaction from '#models/transaction'
import type { GatewayInterface } from '#services/gateways/gateway_interface'
import Gateway1Service from '#services/gateways/gateway1_service'
import Gateway2Service from '#services/gateways/gateway2_service'
import type { PurchaseDTO, PurchaseItem } from '#dtos/purchase_dto'
import PaymentFailedException from '#exceptions/payment_failed_exception'
import db from '@adonisjs/lucid/services/db'
import Product from '#models/product'

/**
 * PaymentService - SRP: responsabilidade única de orquestrar o pagamento
 * OCP: novos gateways = novo entry no Map, zero mudança aqui
 * DIP: depende de GatewayInterface, não das implementações concretas
 */
export default class PaymentService {
    private readonly gatewayMap: Map<string, GatewayInterface>

    constructor() {
        this.gatewayMap = new Map<string, GatewayInterface>([
            ['Gateway1', new Gateway1Service()],
            ['Gateway2', new Gateway2Service()],
        ])
    }

    async purchase(dto: PurchaseDTO) {
        // Fetch products and calculate total
        const productIds = dto.products.map((p: PurchaseItem) => p.id)
        const products = await Product.query().whereIn('id', productIds).where('is_active', true)

        if (products.length !== productIds.length) {
            throw new Error('One or more products not found or inactive')
        }

        const itemsMap = new Map(products.map((p) => [p.id, p]))
        const total = dto.products.reduce((sum: number, item: PurchaseItem) => {
            const product = itemsMap.get(item.id)!
            return sum + product.amount * item.quantity
        }, 0)

        const cardLastNumbers = dto.card.number.slice(-4)

        // Find or create client
        const client = await Client.firstOrCreate(
            { email: dto.client.email },
            { name: dto.client.name, email: dto.client.email }
        )

        // Get active gateways ordered by priority
        const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

        let lastError: Error | null = null

        for (const gateway of gateways) {
            const service = this.gatewayMap.get(gateway.name)
            if (!service) continue

            try {
                const result = await service.charge({
                    amount: total,
                    clientName: client.name,
                    clientEmail: client.email,
                    cardNumber: dto.card.number,
                    cvv: dto.card.cvv,
                })

                // Save transaction atomically using a db transaction
                // tx.useTransaction(trx) sets this.$trx on the model —
                // Lucid v3 passes $trx automatically to related() calls
                const saved = await db.transaction(async (trx) => {
                    const tx = new Transaction()
                    tx.useTransaction(trx)
                    tx.clientId = client.id
                    tx.gatewayId = gateway.id
                    tx.externalId = result.externalId
                    tx.status = 'PAID'
                    tx.amount = total
                    tx.cardLastNumbers = cardLastNumbers
                    await tx.save()

                    // $trx is set on tx so related() uses the same transaction
                    const pivotData: Record<number, { quantity: number; unit_amount: number }> = {}
                    for (const item of dto.products) {
                        pivotData[item.id] = {
                            quantity: item.quantity,
                            unit_amount: itemsMap.get(item.id)!.amount,
                        }
                    }
                    await tx.related('products').attach(pivotData)

                    return tx
                })

                // Lazy load relations for the response
                await saved.load('client')
                await saved.load('gateway')
                await saved.load('products')

                return saved
            } catch (error) {
                lastError = error as Error
                // Try next gateway (fallback)
            }
        }

        throw new PaymentFailedException(lastError?.message ?? 'All gateways failed')
    }

    async refund(transactionId: number): Promise<Transaction> {
        const transaction = await Transaction.query()
            .where('id', transactionId)
            .preload('gateway')
            .firstOrFail()

        if (transaction.status === 'REFUNDED') {
            throw new Error('Transaction already refunded')
        }

        if (transaction.status !== 'PAID') {
            throw new Error('Only paid transactions can be refunded')
        }

        const service = this.gatewayMap.get(transaction.gateway.name)
        if (!service) {
            throw new Error(`No service found for gateway: ${transaction.gateway.name}`)
        }

        await service.refund(transaction.externalId!)
        transaction.status = 'REFUNDED'
        await transaction.save()

        return transaction
    }
}
