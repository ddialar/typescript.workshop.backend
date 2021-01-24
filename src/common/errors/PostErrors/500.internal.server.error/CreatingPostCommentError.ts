import { InternalServerError } from '@errors'

export class CreatingPostCommentError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
