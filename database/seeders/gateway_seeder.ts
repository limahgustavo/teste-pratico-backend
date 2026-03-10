import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'

export default class GatewaySeeder extends BaseSeeder {
    async run() {
        await Gateway.updateOrCreateMany('name', [
            {
                name: 'Gateway1',
                isActive: true,
                priority: 1,
                credentials: {
                    email: 'dev@betalent.tech',
                    token: 'FEC9BB078BF338F464F96B48089EB498',
                },
            },
            {
                name: 'Gateway2',
                isActive: true,
                priority: 2,
                credentials: {
                    authToken: 'tk_f2198cc671b5289fa856',
                    authSecret: '3d15e8ed6131446ea7e3456728b1211f',
                },
            },
        ])
    }
}
