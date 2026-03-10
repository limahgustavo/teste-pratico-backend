import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254).normalizeEmail()
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup (via /auth/signup if needed)
 */
export const signupValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    email: email(),
    password: password(),
    passwordConfirmation: password().confirmed(),
  })
)

/**
 * Validator to use before validating user credentials during login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: email(),
    password: vine.string(),
  })
)
