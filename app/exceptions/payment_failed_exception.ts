import { Exception } from '@adonisjs/core/exceptions'

/**
 * PaymentFailedException - Custom exception with semantic HTTP status
 * All gateways failed to process the payment
 */
export default class PaymentFailedException extends Exception {
    static status = 422
    static code = 'E_PAYMENT_FAILED'

    constructor(message: string = 'Payment processing failed on all gateways') {
        super(message, { status: 422, code: 'E_PAYMENT_FAILED' })
    }
}
