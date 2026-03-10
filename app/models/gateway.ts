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

    /**
     * mysql2 retorna colunas JSON já como objeto — não precisa de JSON.parse.
     * Mas ao salvar, precisa serializar o objeto de volta para string.
     */
    @column({
        prepare: (value: unknown) => {
            if (typeof value === 'string') return value
            return JSON.stringify(value)
        },
        consume: (value: unknown) => {
            if (typeof value === 'string') {
                try { return JSON.parse(value) } catch { return value }
            }
            return value // mysql2 já retornou como objeto
        },
    })
    declare credentials: Record<string, string>

    @hasMany(() => Transaction)
    declare transactions: HasMany<typeof Transaction>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null
}
