import { LoginInputParams } from '@infrastructure/types'
import Joi from 'joi'

import { username, password } from '../validation.rules'

const schema = Joi.object({ username, password })

export const validateLoginParams = ({ username, password }: Partial<LoginInputParams>) => {
  const { error } = schema.validate({ username, password })

  return {
    error: error && error.details[0].message
  }
}
