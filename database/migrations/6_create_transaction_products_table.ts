import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'transaction_products'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('transaction_id').unsigned().notNullable().references('id').inTable('transactions').onDelete('CASCADE')
            table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('RESTRICT')
            table.integer('quantity').notNullable().defaultTo(1)
            table.integer('unit_amount').notNullable().comment('Snapshot of product price at purchase time in cents')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
