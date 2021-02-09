import { ApiError, BAD_REQUEST } from '@errors'

const message = 'New post comment data error.'

export class NewPostCommentError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
