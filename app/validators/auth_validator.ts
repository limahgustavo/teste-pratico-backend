import vine from '@vinejs/vine'

/** Validator para login */
export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(6),
    })
)

/** Validator para criar/atualizar usuário */
export const createUserValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(100),
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(8),
        role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const),
    })
)

export const updateUserValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(100).optional(),
        email: vine.string().email().normalizeEmail().optional(),
        password: vine.string().minLength(8).optional(),
        role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const).optional(),
    })
)
