import { AuthenticatedUserDomainModel, UserDomainModel } from '@domainModels'
import { WrongUsernameError } from '@errors'

import { generateToken } from '@infrastructure/authentication'
import { getUserByUsername } from '@infrastructure/dataSources'

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
  // TODO Throw a 401 error if user doesn't exist
  if (!persistedUser) {
    throw new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`)
  }
  // TODO Validate password against persisted one
  // TODO Throw a 401 error if password doesn't match
  // TODO Generate token
  const token = await getToken(persistedUser.id, username)
  // TODO Update the user's login status recording the new token
  // TODO Return the new token
  return { token }
}
