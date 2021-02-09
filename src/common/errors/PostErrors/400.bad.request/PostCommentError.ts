import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Post comment data error.'

export class PostCommentError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
