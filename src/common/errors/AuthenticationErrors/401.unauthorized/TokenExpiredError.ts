import { ApiError, UNAUTHORIZED } from '@errors'

const message = 'Token expired'

export class TokenExpiredError extends ApiError {
  constructor (description?: string) {
    super(UNAUTHORIZED, message, description)
  }
}
