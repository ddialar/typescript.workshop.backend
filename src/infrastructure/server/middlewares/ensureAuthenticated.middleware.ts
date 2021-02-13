import { Response, NextFunction } from 'express'
import { RequiredTokenNotProvidedError, UserDoesNotExistError, TokenFormatError } from '@errors'
import { checkToken, getUserByToken } from '@domainServices'
import { RequestDto } from '../serverDtos'
import { validateToken } from '@infrastructure/server/validators'

export const ensureAuthenticated = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const [, token] = (req.get('authorization') ?? '').split(' ')
    if (!token) {
      throw new RequiredTokenNotProvidedError()
    }

    const { error, value } = validateToken(token)
    if (error) {
      throw new TokenFormatError(error)
    }
    const { token: validatedToken } = value

    checkToken(validatedToken)

    const persistedUser = await getUserByToken(validatedToken)
    if (!persistedUser) {
      throw new UserDoesNotExistError(`Does not exist any user with token '${validatedToken}'.`)
    }

    req.user = persistedUser
    return next()
  } catch (error) {
    return next(error)
  }
}
