import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'transactions'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('client_id').unsigned().notNullable().references('id').inTable('clients').onDelete('CASCADE')
            table.integer('gateway_id').unsigned().notNullable().references('id').inTable('gateways').onDelete('RESTRICT')
            table.string('external_id').nullable()
            table.enum('status', ['PENDING', 'PAID', 'REFUNDED', 'FAILED']).notNullable().defaultTo('PENDING')
            table.integer('amount').notNullable().comment('Amount in cents')
            table.string('card_last_numbers', 4).nullable()
            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
