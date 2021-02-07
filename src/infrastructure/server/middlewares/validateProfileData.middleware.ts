import { Response, NextFunction } from 'express'
import { EmptyProfileDataError, ProfileDataError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateProfileParams } from '@infrastructure/server/validators'

export const validateProfileData = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { name, surname, avatar } = req.body

    if (!name && !surname && !avatar) {
      throw new EmptyProfileDataError('No one of the allowed fields were provided.')
    }

    const { error } = validateProfileParams({ name, surname, avatar })

    if (error) {
      throw new ProfileDataError(error)
    }

    req.newProfileData = Object
      .entries({ name, surname, avatar })
      .reduce((result, [key, value]) => value ? { ...result, [key]: value } : result, {})

    return next()
  } catch (error) {
    return next(error)
  }
}
