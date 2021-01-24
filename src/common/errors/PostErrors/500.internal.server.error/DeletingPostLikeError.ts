import { InternalServerError } from '@errors'

export class DeletingPostLikeError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
