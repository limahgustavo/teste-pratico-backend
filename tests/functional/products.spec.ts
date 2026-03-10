import { test } from '@japa/runner'

test.group('Products', () => {
    let adminToken: string

    test('setup: login as admin', async ({ client, assert }) => {
        const res = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        res.assertStatus(200)
        adminToken = res.body().data.token
        assert.exists(adminToken)
    })

    test('admin can create a product', async ({ client, assert }) => {
        const res = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: 'Test Product', amount: 9900 })

        res.assertStatus(201)
        assert.equal(res.body().data.amount, 9900)
    })

    test('admin can list products', async ({ client }) => {
        const res = await client
            .get('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)

        res.assertStatus(200)
    })

    test('rejects product with non-integer amount', async ({ client }) => {
        const res = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: 'Bad Product', amount: 9.99 })

        res.assertStatus(422)
    })

    test('returns 401 without auth creating product', async ({ client }) => {
        const res = await client
            .post('/api/v1/products')
            .json({ name: 'No Auth Product', amount: 1000 })

        res.assertStatus(401)
    })
})
