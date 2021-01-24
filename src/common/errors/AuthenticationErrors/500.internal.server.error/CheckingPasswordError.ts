import { InternalServerError } from '@errors'

export class CheckingPasswordError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
