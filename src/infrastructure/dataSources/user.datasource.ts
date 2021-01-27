import { UpdateUserPayloadDomainModel, UserDomainModel } from '@domainModels'

import { mapUserFromDtoToDomainModel } from '@infrastructure/mappers'
import { mongodb } from '@infrastructure/orm'

export const getUserByUsername = async (username: string): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.getByUsername(username))

export const updateUserById = async (userId: string, updatedUserData: UpdateUserPayloadDomainModel): Promise<UserDomainModel | null> =>
  mapUserFromDtoToDomainModel(await mongodb.requests.user.updateById(userId, updatedUserData))
