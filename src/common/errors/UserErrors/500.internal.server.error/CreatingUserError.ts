import { InternalServerError } from '@errors'

export class CreatingUserError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
