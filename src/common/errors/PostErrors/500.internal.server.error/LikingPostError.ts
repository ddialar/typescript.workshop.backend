import { InternalServerError } from '@errors'

export class LikingPostError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
