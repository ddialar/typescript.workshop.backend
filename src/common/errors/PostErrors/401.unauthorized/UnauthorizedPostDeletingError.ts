import { ApiError, UNAUTHORIZED } from '@errors'

const message = 'User not authorized to delete this post'

export class UnauthorizedPostDeletingError extends ApiError {
  constructor (description?: string) {
    super(UNAUTHORIZED, message, description)
  }
}
