import { InternalServerError } from '@errors'

export class DeletingPostCommentError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
