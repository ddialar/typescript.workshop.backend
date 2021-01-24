import { ApiError, UNAUTHORIZED } from '@errors'

const message = 'User not authorized to delete this comment'

export class UnauthorizedPostCommentDeletingError extends ApiError {
  constructor (description?: string) {
    super(UNAUTHORIZED, message, description)
  }
}
