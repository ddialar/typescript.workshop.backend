import { ApiError, UNAUTHORIZED } from '@errors'

const message = 'Username not valid'

export class WrongUsernameError extends ApiError {
  constructor (description?: string) {
    super(UNAUTHORIZED, message, description)
  }
}
