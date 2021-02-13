import { userDataSource } from '@infrastructure/dataSources'
import { UserDomainModel, NewUserDomainModel, UserProfileDomainModel, NewUserProfileDomainModel } from '@domainModels'
import { NewUserAlreadyExistsError, GettingUserError, CreatingUserError, UpdatingUserError, GettingUserProfileError } from '@errors'
import { getUtcTimestampIsoString } from '@common'
import { hashPassword } from '@domainServices'

export const getUserByUsername = async (username: string): Promise<UserDomainModel | null> => {
  try {
    return await userDataSource.getUserByUsername(username)
  } catch ({ message }) {
    throw new GettingUserError(`Error retrieving user with username '${username}' login data. ${message}`)
  }
}

export const getUserByToken = async (token: string): Promise<UserDomainModel | null> => {
  try {
    return await userDataSource.getUserByToken(token)
  } catch ({ message }) {
    throw new GettingUserError(`Error retrieving user with token '${token}' login data. ${message}`)
  }
}

const saveUser = async (newUserData: NewUserDomainModel): Promise<void> => userDataSource.createUser(newUserData)

const checkIfNewUserAlreadyExists = async (username: string) => {
  const persistedUser = await getUserByUsername(username)
  if (persistedUser) {
    throw new NewUserAlreadyExistsError(`User with username '${username}' already exists.`)
  }
}

export const createUser = async (newUserData: NewUserDomainModel): Promise<void> => {
  const { username, password } = newUserData
  await checkIfNewUserAlreadyExists(username)
  const hashedPassword = await hashPassword(password)
  const userDataWithHashedPassword: NewUserDomainModel = {
    ...newUserData,
    password: hashedPassword
  }

  try {
    await saveUser(userDataWithHashedPassword)
  } catch ({ message }) {
    throw new CreatingUserError(`Error updating user with username '${newUserData.username}' login data. ${message}`)
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfileDomainModel | null> => {
  try {
    return await userDataSource.getUserProfileById(userId)
  } catch ({ message }) {
    throw new GettingUserProfileError(`Error retrieving profile for user ${userId}. ${message}`)
  }
}

export const updateUserLoginData = async (userId: string, token: string): Promise<void> => {
  try {
    await userDataSource.updateUserById(userId, { token, lastLoginAt: getUtcTimestampIsoString() })
  } catch ({ message }) {
    throw new UpdatingUserError(`Error updating user '${userId}' login data. ${message}`)
  }
}

export const updateUserLogoutData = async (userId: string): Promise<void> => {
  try {
    await userDataSource.updateUserById(userId, { token: '' })
  } catch ({ message }) {
    throw new UpdatingUserError(`Error updating user '${userId}' logout data. ${message}`)
  }
}

export const updateUserProfile = async (userId: string, newProfileData: NewUserProfileDomainModel): Promise<UserProfileDomainModel | null> => {
  try {
    return await userDataSource.updateUserProfileById(userId, newProfileData)
  } catch ({ message }) {
    throw new UpdatingUserError(`Error updating user '${userId}' profile. ${message}`)
  }
}
