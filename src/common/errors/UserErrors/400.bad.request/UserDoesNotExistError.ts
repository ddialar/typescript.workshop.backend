import { ApiError, BAD_REQUEST } from '@errors'

const message = 'User does not exist'

export class UserDoesNotExistError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
