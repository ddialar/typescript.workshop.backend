import { UserDomainModel, NewUserDomainModel, UserProfileDomainModel, NewUserProfileDomainModel, UpdateUserPayloadDomainModel } from '@domainModels'

export type UserDto = Omit<UserDomainModel, 'id'> & { _id: string }
export type UserProfileDto = UserProfileDomainModel
export type NewUserProfileDto = NewUserProfileDomainModel
export type NewUserInputDto = Omit<NewUserDomainModel, 'username' >
export type NewUserDatabaseDto = NewUserDomainModel
export type UpdateUserPayloadDto = UpdateUserPayloadDomainModel
