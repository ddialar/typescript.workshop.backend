import Joi from 'joi'
import { LoginInputParams } from '@infrastructure/types'

import { username, password } from '../validation.rules'

const schema = Joi.object({ username, password })

interface ValidationResult {
  error?: string
  value: LoginInputParams
}

export const validateLoginParams = ({ username, password }: Partial<LoginInputParams>): ValidationResult => {
  const { error, value } = schema.validate({ username, password })

  return {
    error: error && error.details[0].message,
    value
  }
}
