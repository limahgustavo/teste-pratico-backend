import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import { gatewayPriorityValidator } from '#validators/gateway_validator'

/**
 * GatewaysController - ativar/desativar gateways e alterar prioridade
 * Acesso: somente ADMIN
 */
export default class GatewaysController {
    /** GET /api/v1/gateways */
    async index({ response }: HttpContext) {
        const gateways = await Gateway.query()
            .select('id', 'name', 'is_active', 'priority', 'created_at')
            .orderBy('priority', 'asc')
        return response.ok({ data: gateways, message: 'Gateways retrieved successfully' })
    }

    /** PATCH /api/v1/gateways/:id/toggle — ativa ou desativa o gateway */
    async toggle({ params, response }: HttpContext) {
        const gateway = await Gateway.findOrFail(params.id)
        gateway.isActive = !gateway.isActive
        await gateway.save()

        return response.ok({
            data: { id: gateway.id, name: gateway.name, is_active: gateway.isActive },
            message: `Gateway ${gateway.isActive ? 'activated' : 'deactivated'} successfully`,
        })
    }

    /** PATCH /api/v1/gateways/:id/priority — altera a prioridade do gateway */
    async updatePriority({ params, request, response }: HttpContext) {
        const gateway = await Gateway.findOrFail(params.id)
        const { priority } = await request.validateUsing(gatewayPriorityValidator)

        // Check if priority is already taken by another gateway
        const conflict = await Gateway.query()
            .where('priority', priority)
            .whereNot('id', gateway.id)
            .first()

        if (conflict) {
            // Swap priorities
            conflict.priority = gateway.priority
            await conflict.save()
        }

        gateway.priority = priority
        await gateway.save()

        return response.ok({
            data: { id: gateway.id, name: gateway.name, priority: gateway.priority },
            message: 'Gateway priority updated successfully',
        })
    }
}
