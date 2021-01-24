import { ApiError, UNAUTHORIZED } from '@errors'

const message = 'Password not valid'

export class WrongPasswordError extends ApiError {
  constructor (description?: string) {
    super(UNAUTHORIZED, message, description)
  }
}
