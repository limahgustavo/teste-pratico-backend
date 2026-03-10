import vine from '@vinejs/vine'

/** Validator para criar/atualizar produto */
export const createProductValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(200),
        amount: vine.number().positive().withoutDecimals(),
    })
)

export const updateProductValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(200).optional(),
        amount: vine.number().positive().withoutDecimals().optional(),
        is_active: vine.boolean().optional(),
    })
)
