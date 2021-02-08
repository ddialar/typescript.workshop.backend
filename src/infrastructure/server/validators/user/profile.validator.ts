import { NewUserProfileDto } from '@infrastructure/dtos'
import Joi from 'joi'

import { optionalName, optionalSurname, optionalAvatar } from '../validation.rules'

const schema = Joi.object({ name: optionalName, surname: optionalSurname, avatar: optionalAvatar })

interface ValidationResult {
  error?: string
  value: NewUserProfileDto
}

export const validateProfileParams = (profileParams: NewUserProfileDto): ValidationResult => {
  const { name, surname, avatar } = profileParams
  const { error, value } = schema.validate({ name, surname, avatar })

  return {
    error: error && error.details[0].message,
    value
  }
}
