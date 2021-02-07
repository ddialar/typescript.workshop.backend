import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Empty profile data not allowed'

export class EmptyProfileDataError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
