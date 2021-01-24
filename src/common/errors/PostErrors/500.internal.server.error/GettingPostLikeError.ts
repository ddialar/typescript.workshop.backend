import { InternalServerError } from '@errors'

export class GettingPostLikeError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
