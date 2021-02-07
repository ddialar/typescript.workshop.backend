import { Response, NextFunction } from 'express'
import { LoginDataError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateLoginParams } from '@infrastructure/server/validators'

export const validateLogin = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body
    const { error } = validateLoginParams({ username, password })

    if (error) {
      throw new LoginDataError(error)
    }

    req.loginData = { username, password }

    return next()
  } catch (error) {
    return next(error)
  }
}
