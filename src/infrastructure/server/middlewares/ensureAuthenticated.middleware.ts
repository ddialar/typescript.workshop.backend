import { Response, NextFunction } from 'express'
import { RequiredTokenNotProvidedError, UserDoesNotExistError, TokenFormatError } from '@errors'
import { checkToken, getUserByUsername } from '@domainServices'
import { RequestDto } from '../serverDtos'
import { validateToken } from '@infrastructure/server/validators'

export const ensureAuthenticated = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const [, token] = (req.get('authorization') ?? '').split(' ')
    if (!token) {
      throw new RequiredTokenNotProvidedError()
    }

    const { error } = validateToken(token)
    if (error) {
      throw new TokenFormatError(error)
    }

    const { username } = checkToken(token)

    // TODO: To retrieve the user by the token
    const persistedUser = await getUserByUsername(username)
    if (!persistedUser) {
      throw new UserDoesNotExistError(`Username '${username}' doesn't exists in logout process.`)
    }

    req.user = persistedUser
    return next()
  } catch (error) {
    return next(error)
  }
}
