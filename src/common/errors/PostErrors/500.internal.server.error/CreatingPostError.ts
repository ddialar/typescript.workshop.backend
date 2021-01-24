import { InternalServerError } from '@errors'

export class CreatingPostError extends InternalServerError {
  constructor (description?: string) {
    super()
  }
}
