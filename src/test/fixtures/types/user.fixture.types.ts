import { UserDomainModel } from '@domainModels'

export type UserFixture = Omit<UserDomainModel, 'createdAt' | 'updatedAt' >
export type UserDomainModelFixture = Pick<UserDomainModel, 'id' | 'name' | 'surname' | 'avatar' >
export type UserDtoFixture = Pick<UserDomainModel, 'name' | 'surname' | 'avatar' > & { userId: string }
