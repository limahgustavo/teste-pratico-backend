import vine from '@vinejs/vine'

/** Validator para alterar prioridade do gateway */
export const gatewayPriorityValidator = vine.compile(
    vine.object({
        priority: vine.number().positive().withoutDecimals().min(1),
    })
)
