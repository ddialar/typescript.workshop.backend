import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Wrong login data'

export class LoginDataError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
