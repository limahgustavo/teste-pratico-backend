import vine from '@vinejs/vine'

/** Validator para realizar uma compra */
export const purchaseValidator = vine.compile(
    vine.object({
        client: vine.object({
            name: vine.string().trim().minLength(2).maxLength(100),
            email: vine.string().email().normalizeEmail(),
        }),
        products: vine
            .array(
                vine.object({
                    id: vine.number().positive().withoutDecimals(),
                    quantity: vine.number().positive().withoutDecimals().min(1),
                })
            )
            .minLength(1),
        card: vine.object({
            number: vine.string().regex(/^\d{16}$/).trim(),
            cvv: vine.string().regex(/^\d{3,4}$/).trim(),
        }),
    })
)
