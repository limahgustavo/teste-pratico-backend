import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product_validator'

/**
 * ProductsController - CRUD de produtos
 * ADMIN e MANAGER: acesso total | FINANCE: pode listar/ver
 */
export default class ProductsController {
    /** GET /api/v1/products */
    async index({ response }: HttpContext) {
        const products = await Product.query().where('is_active', true).orderBy('name', 'asc')
        return response.ok({ data: products, message: 'Products retrieved successfully' })
    }

    /** POST /api/v1/products */
    async store({ request, response }: HttpContext) {
        const data = await request.validateUsing(createProductValidator)
        const product = await Product.create({ name: data.name, amount: data.amount, isActive: true })
        return response.created({ data: product, message: 'Product created successfully' })
    }

    /** GET /api/v1/products/:id */
    async show({ params, response }: HttpContext) {
        const product = await Product.findOrFail(params.id)
        return response.ok({ data: product, message: 'Product retrieved successfully' })
    }

    /** PUT /api/v1/products/:id */
    async update({ params, request, response }: HttpContext) {
        const product = await Product.findOrFail(params.id)
        const data = await request.validateUsing(updateProductValidator)
        product.merge({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.amount !== undefined && { amount: data.amount }),
            ...(data.is_active !== undefined && { isActive: data.is_active }),
        })
        await product.save()
        return response.ok({ data: product, message: 'Product updated successfully' })
    }

    /** DELETE /api/v1/products/:id (soft-delete via is_active) */
    async destroy({ params, response }: HttpContext) {
        const product = await Product.findOrFail(params.id)
        product.isActive = false
        await product.save()
        return response.ok({ message: 'Product deactivated successfully' })
    }
}
