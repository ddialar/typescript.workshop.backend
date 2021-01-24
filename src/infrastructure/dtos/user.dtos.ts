import { UserDomainModel, NewUserDomainModel, UserProfileDomainModel, NewUserProfileDomainModel } from '@domainModels'

export type UserDto = Omit<UserDomainModel, 'id'> & { _id: string }
export type UserProfileDto = UserProfileDomainModel
export type NewUserProfileDto = NewUserProfileDomainModel
export type NewUserInputDto = Omit<NewUserDomainModel, 'username' >
export type NewUserDatabaseDto = NewUserDomainModel
export type UpdateUserPayloadDto = Omit<Partial<UserDomainModel>, 'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'>
