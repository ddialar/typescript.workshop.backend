import { UserDomainModel } from '@domainModels'

export type UserDomainModelFixture = Pick<UserDomainModel, 'id' | 'name' | 'surname' | 'avatar' >
export type UserDtoFixture = Pick<UserDomainModel, 'name' | 'surname' | 'avatar' | 'createdAt' | 'updatedAt'> & { _id: string, userId: string }
