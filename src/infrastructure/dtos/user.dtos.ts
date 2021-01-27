import { UpdateUserPayloadDomainModel, UserDomainModel } from '@domainModels'

export type UserDto = Omit<UserDomainModel, 'id'> & { _id: string }
export type NewUserDatabaseDto = Pick<UserDomainModel, 'username' | 'password' | 'email' | 'name' | 'surname' | 'avatar'>
// <== Refactorizamos este tipo
export type UpdateUserPayloadDto = UpdateUserPayloadDomainModel
