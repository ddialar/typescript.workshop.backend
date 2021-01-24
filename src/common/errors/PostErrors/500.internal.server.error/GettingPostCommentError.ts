import { InternalServerError } from '@errors'

export class GettingPostCommentError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
