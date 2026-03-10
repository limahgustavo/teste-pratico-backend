import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth_validator'

/**
 * AuthController - Gerencia autenticação via access tokens
 */
export default class AuthController {
    /**
     * POST /api/v1/auth/login
     * Rota pública - retorna access token
     */
    async login({ request, response, auth }: HttpContext) {
        const { email, password } = await request.validateUsing(loginValidator)

        const user = await User.verifyCredentials(email, password)
        const token = await auth.use('api').createToken(user)

        return response.ok({
            data: {
                token: token.value!.release(),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            message: 'Login successful',
        })
    }

    /**
     * POST /api/v1/auth/logout
     * Rota privada - invalida o token atual
     */
    async logout({ auth, response }: HttpContext) {
        const token = auth.user!.currentAccessToken
        await User.accessTokens.delete(auth.user!, token.identifier)

        return response.ok({ message: 'Logged out successfully' })
    }
}
