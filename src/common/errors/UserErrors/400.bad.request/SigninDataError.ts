import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Signin data error'

export class SigninDataError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
