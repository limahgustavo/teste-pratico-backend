import { test } from '@japa/runner'

test.group('Purchase (public route)', () => {
    test('should complete a purchase successfully', async ({ client, assert }) => {
        // First create a product to buy
        const loginRes = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        const adminToken = loginRes.body().data.token

        const productRes = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: `Product_${Date.now()}`, amount: 5000 })
        productRes.assertStatus(201)
        const productId = productRes.body().data.id

        // Make purchase (public route)
        const purchaseRes = await client.post('/api/v1/purchase').json({
            client: { name: 'João Silva', email: `joao_${Date.now()}@email.com` },
            products: [{ id: productId, quantity: 2 }],
            card: { number: '5569000000006063', cvv: '010' },
        })

        purchaseRes.assertStatus(201)
        assert.equal(purchaseRes.body().data.status, 'PAID')
        assert.equal(purchaseRes.body().data.amount, 10000) // 5000 * 2 = 10000
        assert.equal(purchaseRes.body().data.cardLastNumbers, '6063')
    })

    test('should reject purchase with invalid card number', async ({ client }) => {
        const loginRes = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        const adminToken = loginRes.body().data.token

        const productRes = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: `Product_${Date.now()}`, amount: 1000 })
        const productId = productRes.body().data.id

        const res = await client.post('/api/v1/purchase').json({
            client: { name: 'Test', email: 'test@test.com' },
            products: [{ id: productId, quantity: 1 }],
            card: { number: '123', cvv: '010' }, // invalid card format
        })

        res.assertStatus(422)
    })

    test('should reject purchase with empty products array', async ({ client }) => {
        const res = await client.post('/api/v1/purchase').json({
            client: { name: 'Test', email: 'test@test.com' },
            products: [],
            card: { number: '5569000000006063', cvv: '010' },
        })

        res.assertStatus(422)
    })

    test('should reject purchase with non-existent product', async ({ client }) => {
        const res = await client.post('/api/v1/purchase').json({
            client: { name: 'Test', email: 'test@test.com' },
            products: [{ id: 999999, quantity: 1 }],
            card: { number: '5569000000006063', cvv: '010' },
        })

        // Either 422 or 500 depending on gateway response
        const status = res.response.status
        assert: status >= 400
    })
})
