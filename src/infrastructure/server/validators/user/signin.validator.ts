import { NewUserInputDto } from '@infrastructure/dtos'
import Joi from 'joi'

import { email, password, name, surname, avatar } from '../validation.rules'

const schema = Joi.object({ email, password, name, surname, avatar })

export const validateSigninParams = ({ email, password, name, surname, avatar }: Partial<NewUserInputDto>) => {
  const { error } = schema.validate({ email, password, name, surname, avatar })

  return {
    error: error && error.details[0].message
  }
}
