import { AuthenticatedUserDomainModel } from '@domainModels'
import { getUserByUsername, updateUserLoginData, updateUserLogoutData, checkPassword } from '@domainServices'
import { decodeToken, generateToken } from '@infrastructure/authentication'
import { DecodedJwtToken } from '@infrastructure/types'
import { GettingTokenError, WrongUsernameError, WrongPasswordError, TokenExpiredError, CheckingTokenError } from '@errors'

const getToken = (userId: string, username: string): string => {
  try {
    return generateToken(userId, username)
  } catch ({ message }) {
    throw new GettingTokenError(`Error getting token for username '${username}'. ${message}`)
  }
}

export const checkToken = (token: string): DecodedJwtToken => {
  try {
    return decodeToken(token)
  } catch ({ message }) {
    throw (message.match(/expired/))
      ? new TokenExpiredError(`Token '${token}' expired`)
      : new CheckingTokenError(`Error ckecking token '${token}'. ${message}`)
  }
}

export const login = async (username: string, password: string): Promise<AuthenticatedUserDomainModel> => {
  const persistedUser = await getUserByUsername(username)
  if (!persistedUser) {
    throw new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`)
  }
  const validPassword = await checkPassword(password, persistedUser.password)
  if (!validPassword) {
    throw new WrongPasswordError(`Password missmatches for username '${username}' in login process.`)
  }
  const token = await getToken(persistedUser.id, username)
  await updateUserLoginData(persistedUser.id, token)

  return {
    token
  }
}

export const logout = async (userId: string): Promise<void> => {
  await updateUserLogoutData(userId)
}
