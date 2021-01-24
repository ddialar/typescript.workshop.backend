import { ApiError, NOT_FOUND } from '@errors'

const message = 'Post comment not found'

export class PostCommentNotFoundError extends ApiError {
  constructor (description?: string) {
    super(NOT_FOUND, message, description)
  }
}
