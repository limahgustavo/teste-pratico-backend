import { test } from '@japa/runner'

test.group('Auth', () => {
    test('should login with valid credentials and return token', async ({ client, assert }) => {
        const response = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })

        response.assertStatus(200)
        assert.exists(response.body().data.token)
        assert.equal(response.body().data.user.role, 'ADMIN')
    })

    test('should return 400 with invalid credentials', async ({ client }) => {
        const response = await client.post('/api/v1/auth/login').json({
            email: 'wrong@email.com',
            password: 'wrongpassword',
        })

        response.assertStatus(400)
    })

    test('should return 422 with missing fields', async ({ client }) => {
        const response = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
        })

        response.assertStatus(422)
    })

    test('should logout successfully with valid token', async ({ client }) => {
        const loginRes = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        const token = loginRes.body().data.token

        const response = await client
            .post('/api/v1/auth/logout')
            .header('Authorization', `Bearer ${token}`)

        response.assertStatus(200)
    })
})
