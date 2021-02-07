import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Profile data error'

export class ProfileDataError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
