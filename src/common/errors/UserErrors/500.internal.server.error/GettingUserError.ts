import { InternalServerError } from '@errors'

export class GettingUserError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
