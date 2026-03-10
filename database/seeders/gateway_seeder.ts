import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Gateway from '#models/gateway'

export default class GatewaySeeder extends BaseSeeder {
    async run() {
        // Limpa a tabela primeiro para evitar dados corrompidos de runs anteriores
        // (o updateOrCreateMany não chama o hook prepare do @column)
        await db.from('gateways').delete()

        const g1 = new Gateway()
        g1.name = 'Gateway1'
        g1.isActive = true
        g1.priority = 1
        g1.credentials = {
            email: 'dev@betalent.tech',
            token: 'FEC9BB078BF338F464F96B48089EB498',
        }
        await g1.save()

        const g2 = new Gateway()
        g2.name = 'Gateway2'
        g2.isActive = true
        g2.priority = 2
        g2.credentials = {
            authToken: 'tk_f2198cc671b5289fa856',
            authSecret: '3d15e8ed6131446ea7e3456728b1211f',
        }
        await g2.save()
    }
}
