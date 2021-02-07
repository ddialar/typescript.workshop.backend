import { ApiError, BAD_REQUEST } from '@errors'

const message = 'Post identification not valid'

export class PostIdentificationError extends ApiError {
  constructor (description?: string) {
    super(BAD_REQUEST, message, description)
  }
}
