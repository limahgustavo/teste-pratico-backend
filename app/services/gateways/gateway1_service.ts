import axios from 'axios'
import env from '#start/env'
import type { GatewayInterface } from '#services/gateways/gateway_interface'
import type { ChargeData, ChargeResult } from '#dtos/purchase_dto'

/**
 * Gateway 1 Service - LSP: implementa GatewayInterface de forma intercambiável
 * Autentica via POST /login e reutiliza o token em memória
 */
export default class Gateway1Service implements GatewayInterface {
    private token: string | null = null
    private readonly baseUrl: string

    constructor() {
        this.baseUrl = env.get('GATEWAY1_URL')
    }

    private async authenticate(): Promise<string> {
        if (this.token) return this.token

        const { data } = await axios.post(`${this.baseUrl}/login`, {
            email: env.get('GATEWAY1_EMAIL'),
            token: env.get('GATEWAY1_TOKEN'),
        })

        this.token = data.token as string
        return this.token
    }

    async charge(data: ChargeData): Promise<ChargeResult> {
        const token = await this.authenticate()

        const { data: response } = await axios.post(
            `${this.baseUrl}/transactions`,
            {
                amount: data.amount,
                name: data.clientName,
                email: data.clientEmail,
                cardNumber: data.cardNumber,
                cvv: data.cvv,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )

        return {
            externalId: String(response.id),
            status: 'PAID',
        }
    }

    async refund(externalId: string): Promise<void> {
        const token = await this.authenticate()

        await axios.post(
            `${this.baseUrl}/transactions/${externalId}/charge_back`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
    }
}
