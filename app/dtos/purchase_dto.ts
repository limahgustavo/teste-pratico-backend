/** DTOs for payment flows */

export interface ChargeData {
    amount: number
    clientName: string
    clientEmail: string
    cardNumber: string
    cvv: string
}

export interface ChargeResult {
    externalId: string
    status: 'PAID'
}

export interface PurchaseItem {
    id: number
    quantity: number
}

export interface PurchaseDTO {
    client: {
        name: string
        email: string
    }
    products: PurchaseItem[]
    card: {
        number: string
        cvv: string
    }
}
