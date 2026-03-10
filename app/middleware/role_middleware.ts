import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * RoleMiddleware - Verifica se o usuário autenticado tem um dos roles permitidos
 * Uso: middleware.role(['ADMIN', 'MANAGER'])
 */
export default class RoleMiddleware {
    async handle(ctx: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
        const user = ctx.auth.user

        if (!user) {
            return ctx.response.unauthorized({ error: 'Unauthenticated', message: 'Login required' })
        }

        if (!options.roles.includes(user.role)) {
            return ctx.response.forbidden({
                error: 'Forbidden',
                message: `Access restricted to: ${options.roles.join(', ')}`,
            })
        }

        return next()
    }
}
