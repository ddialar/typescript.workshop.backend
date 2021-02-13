import { UserDomainModel, NewUserDomainModel, UserProfileDomainModel, UpdateUserPayloadDomainModel, NewUserProfileDomainModel } from '@domainModels'
import { mapUserFromDtoToDomainModel, mapUserFromDtoToProfileDomainModel } from '@infrastructure/mappers'
import { mongodb } from '@infrastructure/orm'

export const createUser = async (newUserData: NewUserDomainModel): Promise<void> => {
  await mongodb.requests.user.create(newUserData)
}

export const getUserByUsername = async (username: string): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.getByUsername(username))

export const getUserByToken = async (token: string): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.getByToken(token))

export const getUserProfileById = async (userId: string): Promise<UserProfileDomainModel | null> =>
  mongodb.requests.user.getProfileById(userId)

export const updateUserById = async (userId: string, updatedUserData: UpdateUserPayloadDomainModel): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.updateById(userId, updatedUserData))

export const updateUserProfileById = async (userId: string, newUserProfileData: NewUserProfileDomainModel): Promise<UserProfileDomainModel | null> =>
  mapUserFromDtoToProfileDomainModel(await mongodb.requests.user.updateById(userId, newUserProfileData))
