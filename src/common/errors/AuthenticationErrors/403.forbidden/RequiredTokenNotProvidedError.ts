import { ApiError, FORBIDDEN } from '@errors'

const message = 'Required token was not provided'

export class RequiredTokenNotProvidedError extends ApiError {
  constructor (description?: string) {
    super(FORBIDDEN, message, description)
  }
}
