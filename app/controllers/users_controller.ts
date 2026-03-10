import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/auth_validator'
import hash from '@adonisjs/core/services/hash'

/**
 * UsersController - CRUD de usuários (somente ADMIN)
 */
export default class UsersController {
    /** GET /api/v1/users */
    async index({ response }: HttpContext) {
        const users = await User.query().select('id', 'name', 'email', 'role', 'created_at')
        return response.ok({ data: users, message: 'Users retrieved successfully' })
    }

    /** POST /api/v1/users */
    async store({ request, response }: HttpContext) {
        const data = await request.validateUsing(createUserValidator)
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
        })
        return response.created({
            data: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'User created successfully',
        })
    }

    /** GET /api/v1/users/:id */
    async show({ params, response }: HttpContext) {
        const user = await User.query()
            .select('id', 'name', 'email', 'role', 'created_at')
            .where('id', params.id)
            .firstOrFail()
        return response.ok({ data: user, message: 'User retrieved successfully' })
    }

    /** PUT /api/v1/users/:id */
    async update({ params, request, response }: HttpContext) {
        const user = await User.findOrFail(params.id)
        const data = await request.validateUsing(updateUserValidator)

        if (data.password) {
            data.password = await hash.make(data.password)
        }

        user.merge(data as Partial<User>)
        await user.save()

        return response.ok({
            data: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'User updated successfully',
        })
    }

    /** DELETE /api/v1/users/:id */
    async destroy({ params, auth, response }: HttpContext) {
        const user = await User.findOrFail(params.id)

        if (user.id === auth.user!.id) {
            return response.badRequest({ error: 'Cannot delete yourself' })
        }

        await user.delete()
        return response.ok({ message: 'User deleted successfully' })
    }
}
