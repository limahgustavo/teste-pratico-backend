import { test } from '@japa/runner'

test.group('Users - Role ADMIN', () => {
    let token: string

    test('setup: login as admin', async ({ client, assert }) => {
        const res = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        res.assertStatus(200)
        token = res.body().data.token
        assert.exists(token)
    })

    test('admin can list users', async ({ client }) => {
        const res = await client
            .get('/api/v1/users')
            .header('Authorization', `Bearer ${token}`)

        res.assertStatus(200)
    })

    test('admin can create a user', async ({ client, assert }) => {
        const res = await client
            .post('/api/v1/users')
            .header('Authorization', `Bearer ${token}`)
            .json({
                name: 'Test Manager',
                email: `manager_${Date.now()}@test.com`,
                password: 'Test@1234',
                role: 'MANAGER',
            })

        res.assertStatus(201)
        assert.equal(res.body().data.role, 'MANAGER')
    })

    test('returns 401 without token', async ({ client }) => {
        const res = await client.get('/api/v1/users')
        res.assertStatus(401)
    })

    test('returns 403 for non-ADMIN role trying to list users', async ({ client }) => {
        // Create a FINANCE user and login
        const createRes = await client
            .post('/api/v1/users')
            .header('Authorization', `Bearer ${token}`)
            .json({
                name: 'Finance User',
                email: `finance_${Date.now()}@test.com`,
                password: 'Finance@1234',
                role: 'FINANCE',
            })
        createRes.assertStatus(201)

        const loginRes = await client.post('/api/v1/auth/login').json({
            email: createRes.body().data.email,
            password: 'Finance@1234',
        })
        const financeToken = loginRes.body().data.token

        const res = await client
            .get('/api/v1/users')
            .header('Authorization', `Bearer ${financeToken}`)
        res.assertStatus(403)
    })
})
