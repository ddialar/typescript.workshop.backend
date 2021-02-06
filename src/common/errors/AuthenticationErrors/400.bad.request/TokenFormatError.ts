import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Wrong token format'

export class TokenFormatError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
