import { InternalServerError } from '@errors'

export class DeletingPostError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
