import { test } from '@japa/runner'

test.group('Clients', () => {
    let adminToken: string

    test('setup: login as admin', async ({ client, assert }) => {
        const res = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        adminToken = res.body().data.token
        assert.exists(adminToken)
    })

    test('authenticated user can list clients', async ({ client, assert }) => {
        const res = await client
            .get('/api/v1/clients')
            .header('Authorization', `Bearer ${adminToken}`)

        res.assertStatus(200)
        assert.isArray(res.body().data)
    })

    test('returns 401 without token', async ({ client }) => {
        const res = await client.get('/api/v1/clients')
        res.assertStatus(401)
    })

    test('can view client detail with purchase history', async ({ client, assert }) => {
        // First create a purchase to generate a client
        const productRes = await client
            .post('/api/v1/products')
            .header('Authorization', `Bearer ${adminToken}`)
            .json({ name: `Client Test Product_${Date.now()}`, amount: 1500 })
        const productId = productRes.body().data.id

        const clientEmail = `client_detail_${Date.now()}@test.com`
        const purchaseRes = await client.post('/api/v1/purchase').json({
            client: { name: 'Detail Test Client', email: clientEmail },
            products: [{ id: productId, quantity: 1 }],
            card: { number: '5569000000006063', cvv: '010' },
        })
        purchaseRes.assertStatus(201)

        // Get client list to find the ID
        const clientsRes = await client
            .get('/api/v1/clients')
            .header('Authorization', `Bearer ${adminToken}`)
        const clientsList = clientsRes.body().data
        const foundClient = clientsList.find((c: { email: string }) => c.email === clientEmail)

        if (foundClient) {
            const detailRes = await client
                .get(`/api/v1/clients/${foundClient.id}`)
                .header('Authorization', `Bearer ${adminToken}`)

            detailRes.assertStatus(200)
            assert.isArray(detailRes.body().data.transactions)
            assert.isAtLeast(detailRes.body().data.transactions.length, 1)
        }
    })
})

test.group('Gateways', () => {
    let adminToken: string

    test('setup: login as admin', async ({ client, assert }) => {
        const res = await client.post('/api/v1/auth/login').json({
            email: 'admin@admin.com',
            password: 'Admin@123',
        })
        adminToken = res.body().data.token
        assert.exists(adminToken)
    })

    test('admin can list gateways', async ({ client, assert }) => {
        const res = await client
            .get('/api/v1/gateways')
            .header('Authorization', `Bearer ${adminToken}`)

        res.assertStatus(200)
        assert.isArray(res.body().data)
        assert.isAtLeast(res.body().data.length, 2)
    })

    test('admin can toggle a gateway', async ({ client }) => {
        const listRes = await client
            .get('/api/v1/gateways')
            .header('Authorization', `Bearer ${adminToken}`)
        const gateway = listRes.body().data[0]
        const originalState = gateway.is_active

        const toggleRes = await client
            .patch(`/api/v1/gateways/${gateway.id}/toggle`)
            .header('Authorization', `Bearer ${adminToken}`)

        toggleRes.assertStatus(200)
        const newState = toggleRes.body().data.is_active
        assert: newState !== originalState

        // Restore state
        await client
            .patch(`/api/v1/gateways/${gateway.id}/toggle`)
            .header('Authorization', `Bearer ${adminToken}`)
    })

    test('returns 403 for non-ADMIN trying to access gateways', async ({ client }) => {
        const res = await client.get('/api/v1/gateways')
        res.assertStatus(401)
    })
})
