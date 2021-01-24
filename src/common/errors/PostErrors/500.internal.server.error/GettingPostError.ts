import { InternalServerError } from '@errors'

export class GettingPostError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
