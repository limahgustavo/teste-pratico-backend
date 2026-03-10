import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'

export type TransactionStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export default class Transaction extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare clientId: number

    @column()
    declare gatewayId: number

    @column()
    declare externalId: string | null

    @column()
    declare status: TransactionStatus

    /** Total amount in cents */
    @column()
    declare amount: number

    @column()
    declare cardLastNumbers: string | null

    @belongsTo(() => Client)
    declare client: BelongsTo<typeof Client>

    @belongsTo(() => Gateway)
    declare gateway: BelongsTo<typeof Gateway>

    @manyToMany(() => Product, {
        pivotTable: 'transaction_products',
        pivotColumns: ['quantity', 'unit_amount'],
    })
    declare products: ManyToMany<typeof Product>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null
}
