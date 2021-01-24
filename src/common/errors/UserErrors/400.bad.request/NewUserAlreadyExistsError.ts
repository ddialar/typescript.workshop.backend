import { ApiError, BAD_REQUEST } from '@errors'

const message = 'User already exists'

export class NewUserAlreadyExistsError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
