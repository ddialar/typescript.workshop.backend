import { AuthenticatedUserDomainModel, UserDomainModel } from '@domainModels'
import { WrongPasswordError, WrongUsernameError } from '@errors'

import { generateToken } from '@infrastructure/authentication'
import { getUserByUsername } from '@infrastructure/dataSources'
import { checkPassword, updateUserLoginData } from '@domainServices'

const getToken = (userId: string, username: string): string => {
  try {
    return generateToken(userId, username)
  } catch ({ message }) {
    // TODO Throw a 500 error if there are an error generating the token
    throw new Error(`[ERROR] - ${message}`)
  }
}

export const login = async (username: string, password: string): Promise<AuthenticatedUserDomainModel> => {
  const persistedUser = await getUserByUsername(username) as UserDomainModel
  if (!persistedUser) {
    throw new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`)
  }
  const validPassword = await checkPassword(password, persistedUser.password)
  if (!validPassword) {
    throw new WrongPasswordError(`Password missmatches for username '${username}' in login process.`)
  }
  const token = await getToken(persistedUser.id, username)
  // TODO Update the user's login status recording the new token
  await updateUserLoginData(persistedUser.id, token)
  return { token }
}
