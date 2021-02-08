import { NewUserInputDto } from '@infrastructure/dtos'
import Joi from 'joi'

import { email, password, requiredName, requiredSurname, requiredAvatar } from '../validation.rules'

const schema = Joi.object({ email, password, name: requiredName, surname: requiredSurname, avatar: requiredAvatar })

interface ValidationResult {
  error?: string
  value: NewUserInputDto
}

export const validateSigninParams = ({ email, password, name, surname, avatar }: Partial<NewUserInputDto>): ValidationResult => {
  const { error, value } = schema.validate({ email, password, name, surname, avatar })

  return {
    error: error && error.details[0].message,
    value
  }
}
