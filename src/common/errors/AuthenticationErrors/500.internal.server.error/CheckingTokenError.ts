import { InternalServerError } from '@errors'

export class CheckingTokenError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
