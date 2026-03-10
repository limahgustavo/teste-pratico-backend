import Gateway from '#models/gateway'
import Client from '#models/client'
import Transaction from '#models/transaction'
import type { GatewayInterface } from '#services/gateways/gateway_interface'
import Gateway1Service from '#services/gateways/gateway1_service'
import Gateway2Service from '#services/gateways/gateway2_service'
import type { PurchaseDTO } from '#dtos/purchase_dto'
import PaymentFailedException from '#exceptions/payment_failed_exception'
import { db } from '@adonisjs/lucid/services/db'

/**
 * PaymentService - SRP: responsabilidade única de orquestrar o pagamento
 * OCP: novos gateways = novo entry no Map, zero mudança aqui
 * DIP: depende de GatewayInterface, não das implementações concretas
 */
export default class PaymentService {
    private readonly gatewayMap: Map<string, GatewayInterface>

    constructor() {
        this.gatewayMap = new Map([
            ['Gateway1', new Gateway1Service()],
            ['Gateway2', new Gateway2Service()],
        ])
    }

    async purchase(dto: PurchaseDTO) {
        // Fetch products and calculate total
        const Product = (await import('#models/product')).default
        const productIds = dto.products.map((p) => p.id)
        const products = await Product.query().whereIn('id', productIds).where('is_active', true)

        if (products.length !== productIds.length) {
            throw new Error('One or more products not found or inactive')
        }

        const itemsMap = new Map(products.map((p) => [p.id, p]))
        const total = dto.products.reduce((sum, item) => {
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

                // Save transaction inside a DB transaction for atomicity
                const transaction = await db.transaction(async (trx) => {
                    const tx = await Transaction.create(
                        {
                            clientId: client.id,
                            gatewayId: gateway.id,
                            externalId: result.externalId,
                            status: 'PAID',
                            amount: total,
                            cardLastNumbers: cardLastNumbers,
                        },
                        { client: trx }
                    )

                    // Attach products with pivot data
                    const pivotData: Record<number, { quantity: number; unit_amount: number }> = {}
                    for (const item of dto.products) {
                        pivotData[item.id] = {
                            quantity: item.quantity,
                            unit_amount: itemsMap.get(item.id)!.amount,
                        }
                    }
                    await tx.related('products').attach(pivotData, trx)

                    return tx
                })

                await transaction.load('client')
                await transaction.load('gateway')
                await transaction.load('products')

                return transaction
            } catch (error) {
                lastError = error as Error
                // Try next gateway
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
