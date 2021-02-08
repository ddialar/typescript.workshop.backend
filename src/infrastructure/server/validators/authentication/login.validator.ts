import { LoginInputParams } from '@infrastructure/types'
import Joi from 'joi'

import { username, password } from '../validation.rules'
import { UserDto } from '@infrastructure/dtos'

const schema = Joi.object({ username, password })

interface ValidationResult {
  error?: string
  value: {
    username: UserDto['username'],
    password: UserDto['password']
  }
}

export const validateLoginParams = ({ username, password }: Partial<LoginInputParams>): ValidationResult => {
  const { error, value } = schema.validate({ username, password })

  return {
    error: error && error.details[0].message,
    value
  }
}
