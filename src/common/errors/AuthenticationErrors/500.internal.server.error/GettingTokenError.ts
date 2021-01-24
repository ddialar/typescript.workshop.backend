import { InternalServerError } from '@errors'

export class GettingTokenError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
