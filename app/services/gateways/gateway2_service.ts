import axios from 'axios'
import env from '#start/env'
import type { GatewayInterface } from '#services/gateways/gateway_interface'
import type { ChargeData, ChargeResult } from '#dtos/purchase_dto'

/**
 * Gateway 2 Service - LSP: implementa GatewayInterface de forma intercambiável
 * Usa headers estáticos para autenticação (não precisa de login)
 */
export default class Gateway2Service implements GatewayInterface {
    private readonly baseUrl: string
    private readonly headers: Record<string, string>

    constructor() {
        this.baseUrl = env.get('GATEWAY2_URL')
        this.headers = {
            'Gateway-Auth-Token': env.get('GATEWAY2_AUTH_TOKEN'),
            'Gateway-Auth-Secret': env.get('GATEWAY2_AUTH_SECRET'),
        }
    }

    async charge(data: ChargeData): Promise<ChargeResult> {
        const { data: response } = await axios.post(
            `${this.baseUrl}/transacoes`,
            {
                valor: data.amount,
                nome: data.clientName,
                email: data.clientEmail,
                numeroCartao: data.cardNumber,
                cvv: data.cvv,
            },
            { headers: this.headers }
        )

        return {
            externalId: String(response.id),
            status: 'PAID',
        }
    }

    async refund(externalId: string): Promise<void> {
        await axios.post(
            `${this.baseUrl}/transacoes/reembolso`,
            { id: externalId },
            { headers: this.headers }
        )
    }
}
