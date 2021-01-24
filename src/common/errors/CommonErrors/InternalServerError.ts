import { ApiError, INTERNAL_SERVER_ERROR } from '@errors'

const message = 'Internal Server Error'

export class InternalServerError extends ApiError {
  constructor (description?: string) {
    super(INTERNAL_SERVER_ERROR, message, description)
  }
}
