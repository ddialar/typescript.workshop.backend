import { Response, NextFunction } from 'express'
import { LoginDataError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateLoginParams } from '@infrastructure/server/validators'

export const validateLogin = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body
    const { error, value } = validateLoginParams({ username, password })

    if (error) {
      throw new LoginDataError(error)
    }

    req.loginData = { ...value }

    return next()
  } catch (error) {
    return next(error)
  }
}
