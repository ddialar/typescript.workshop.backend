import { ApiError, NOT_FOUND } from '@errors'

const message = 'Post not found'

export class PostNotFoundError extends ApiError {
  constructor (description?: string) {
    super(NOT_FOUND, message, description)
  }
}
