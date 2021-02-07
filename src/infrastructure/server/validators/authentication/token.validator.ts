import Joi from 'joi'

import { token } from '../validation.rules'

const schema = Joi.object({ token })

export const validateToken = (token?: string) => {
  const { error } = schema.validate({ token })

  return {
    error: error && error.details[0].message
  }
}
