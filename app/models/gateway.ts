import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'

export default class Gateway extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column()
    declare isActive: boolean

    @column()
    declare priority: number

    @column({
        prepare: (value: object) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value),
    })
    declare credentials: Record<string, string>

    @hasMany(() => Transaction)
    declare transactions: HasMany<typeof Transaction>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null
}
