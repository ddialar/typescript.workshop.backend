import { ApiError, BAD_REQUEST } from '@errors'

const message = 'User must like a post before dislike it'

export class PostDislikeUserError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
