import { ApiError, BAD_REQUEST } from '@errors'

const message = 'New post data error.'

export class NewPostError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
