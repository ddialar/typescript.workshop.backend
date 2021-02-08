import { Response, NextFunction } from 'express'
import { SigninDataError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateSigninParams } from '@infrastructure/server/validators'

export const validateSignin = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, surname, avatar } = req.body

    const { error, value } = validateSigninParams({ email, password, name, surname, avatar })

    if (error) {
      throw new SigninDataError(error)
    }

    req.signinData = { ...value }

    return next()
  } catch (error) {
    return next(error)
  }
}
