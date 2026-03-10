import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
    async run() {
        await User.updateOrCreateMany('email', [
            {
                name: 'Admin',
                email: 'admin@admin.com',
                password: await hash.make('Admin@123'),
                role: 'ADMIN',
            },
        ])
    }
}
