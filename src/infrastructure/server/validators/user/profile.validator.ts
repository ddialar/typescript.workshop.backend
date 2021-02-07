import { NewUserProfileDto } from '@infrastructure/dtos'
import Joi from 'joi'

import { optionalName, optionalSurname, optionalAvatar } from '../validation.rules'

const schema = Joi.object({ name: optionalName, surname: optionalSurname, avatar: optionalAvatar })

export const validateProfileParams = (profileParams: Partial<NewUserProfileDto>) => {
  const { name, surname, avatar } = profileParams
  const { error } = schema.validate({ name, surname, avatar })

  return {
    error: error && error.details[0].message
  }
}
