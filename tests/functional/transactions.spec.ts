import { test } from '@japa/runner'

test.group('Transactions', () => {
    let adminToken: string

    test('setup: login as admin', async ({ client, assert }) => {
        const res = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        adminToken = res.body().data.token
        assert.exists(adminToken)
    })

    test('admin can list all transactions', async ({ client }) => {
        const res = await client
            .get('/api/v1/transactions')
            .header('Authorization', `Bearer ${adminToken}`)

        res.assertStatus(200)
        const body = res.body()
        assert: Array.isArray(body.data)
    })

    test('returns 401 listing transactions without token', async ({ client }) => {
        const res = await client.get('/api/v1/transactions')
        res.assertStatus(401)
    })

    test('returns 404 for non-existent transaction', async ({ client }) => {
        const res = await client
            .get('/api/v1/transactions/999999')
            .header('Authorization', `Bearer ${adminToken}`)

        res.assertStatus(404)
    })
})

test.group('Transactions - Refund', () => {
    let adminToken: string
    let financeToken: string

    test('setup: create admin and finance tokens', async ({ client, assert }) => {
        const adminLogin = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        adminToken = adminLogin.body().data.token

        // Create finance user
        const financeEmail = `finance_refund_${Date.now()}@test.com`
        await client
            .post('/api/v1/users')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: 'Finance Refund', email: financeEmail, password: 'Finance@1234', role: 'FINANCE' })

        const financeLogin = await client.post('/api/v1/auth/login').json({
            email: financeEmail,
            password: 'Finance@1234',
        })
        financeToken = financeLogin.body().data.token
        assert.exists(financeToken)
    })

    test('FINANCE role can refund a transaction', async ({ client, assert }) => {
        // Create product and make a purchase first
        const productRes = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: `Refund Product_${Date.now()}`, amount: 2000 })
        const productId = productRes.body().data.id

        const purchaseRes = await client.post('/api/v1/purchase').json({
            client: { name: 'Refund Test', email: `refund_${Date.now()}@test.com` },
            products: [{ id: productId, quantity: 1 }],
            card: { number: '5569000000006063', cvv: '010' },
        })
        purchaseRes.assertStatus(201)
        const transactionId = purchaseRes.body().data.transactionId

        // Refund using FINANCE role
        const refundRes = await client
            .post(`/api/v1/transactions/${transactionId}/refund`)
            .header('Authorization', `Bearer ${financeToken}`)

        refundRes.assertStatus(200)
        assert.equal(refundRes.body().data.status, 'REFUNDED')
    })

    test('USER role cannot refund', async ({ client }) => {
        // Create a USER role
        const userEmail = `user_${Date.now()}@test.com`
        await client
            .post('/api/v1/users')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: 'Regular User', email: userEmail, password: 'User@1234', role: 'USER' })

        const userLogin = await client.post('/api/v1/auth/login').json({
            email: userEmail,
            password: 'User@1234',
        })
        const userToken = userLogin.body().data.token

        const res = await client
            .post('/api/v1/transactions/1/refund')
            .header('Authorization', `Bearer ${userToken}`)

        res.assertStatus(403)
    })
})
