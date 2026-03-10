import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'

export default class GatewaySeeder extends BaseSeeder {
    async run() {
        // updateOrCreateMany não passa pelo prepare/consume do @column
        // Usando upsert direto com o JSON serializado manualmente
        const gateways = [
            {
                name: 'Gateway1',
                is_active: true,
                priority: 1,
                credentials: JSON.stringify({
                    email: 'dev@betalent.tech',
                    token: 'FEC9BB078BF338F464F96B48089EB498',
                }),
            },
            {
                name: 'Gateway2',
                is_active: true,
                priority: 2,
                credentials: JSON.stringify({
                    authToken: 'tk_f2198cc671b5289fa856',
                    authSecret: '3d15e8ed6131446ea7e3456728b1211f',
                }),
            },
        ]

        for (const gw of gateways) {
            await Gateway.updateOrCreate({ name: gw.name }, {
                name: gw.name,
                isActive: gw.is_active,
                priority: gw.priority,
                credentials: JSON.parse(gw.credentials),
            })
        }
    }
}
