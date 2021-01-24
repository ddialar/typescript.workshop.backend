import { UserDomainModel, NewUserDomainModel, UserProfileDomainModel } from '@domainModels'
import { NewUserProfileDto, UpdateUserPayloadDto } from '@infrastructure/dtos'
import { mapUserFromDtoToDomainModel, mapUserFromDtoToProfileDomainModel } from '@infrastructure/mappers'
import { mongodb } from '@infrastructure/orm'

export const createUser = async (newUserData: NewUserDomainModel): Promise<void> => {
  await mongodb.requests.user.create(newUserData)
}

export const getUserByUsername = async (username: string): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.getByUsername(username))
export const getUserProfileById = async (userId: string): Promise<UserProfileDomainModel | null> =>
  mongodb.requests.user.getProfileById(userId)

export const updateUserById = async (userId: string, updatedUserData: UpdateUserPayloadDto): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.updateById(userId, updatedUserData))
export const updateUserProfileById = async (userId: string, newUserProfileData: NewUserProfileDto): Promise<UserProfileDomainModel | null> =>
  mapUserFromDtoToProfileDomainModel(await mongodb.requests.user.updateById(userId, newUserProfileData))
