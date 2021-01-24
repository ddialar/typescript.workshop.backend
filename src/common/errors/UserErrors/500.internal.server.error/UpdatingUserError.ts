import { InternalServerError } from '@errors'

export class UpdatingUserError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
