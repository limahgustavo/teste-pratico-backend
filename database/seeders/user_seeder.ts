import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class UserSeeder extends BaseSeeder {
    async run() {
        // O withAuthFinder mixin faz o hash automaticamente no save()
        // NÃO usar hash.make() aqui, pois causaria duplo hash
        await User.updateOrCreateMany('email', [
            {
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'Admin@123',
                role: 'ADMIN',
            },
        ])
    }
}
