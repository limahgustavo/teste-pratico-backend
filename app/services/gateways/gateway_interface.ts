/** Gateway Interface - ISP (Interface Segregation Principle)
 * Separado em dois contratos menores: cobrar e reembolsar
 */

import type { ChargeData, ChargeResult } from '#dtos/purchase_dto'

/** Contrato para processar cobranças */
export interface ChargeableGateway {
    charge(data: ChargeData): Promise<ChargeResult>
}

/** Contrato para processar reembolsos */
export interface RefundableGateway {
    refund(externalId: string): Promise<void>
}

/** Interface completa do gateway (SRP: responsabilidade de integração) */
export type GatewayInterface = ChargeableGateway & RefundableGateway
