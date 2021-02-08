import Joi from 'joi'

import { token } from '../validation.rules'
import { UserDto } from '@infrastructure/dtos'

const schema = Joi.object({ token })

interface ValidationResult {
  error?: string
  value?: {
    token: UserDto['token']
  }
}

export const validateToken = (token?: string): ValidationResult => {
  const { error, value } = schema.validate({ token })

  return {
    error: error && error.details[0].message,
    value
  }
}
