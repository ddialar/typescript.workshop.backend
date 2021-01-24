import { InternalServerError } from '@errors'

export class GettingUserProfileError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
