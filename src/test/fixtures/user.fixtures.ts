import mockedUsers from './assets/users.json'
import { avatarUrls } from './assets/avatarUrls.json'
import { UserDomainModel } from '@domainModels'
import { generateMockedMongoDbId } from './utils.fixtures'

export const testingNonValidUserId = generateMockedMongoDbId()

export const testingNonPersistedUsername = 'non.persisted@mail.com'

export const testingUsers: UserDomainModel[] = mockedUsers
export const testingAvatarUrls: string[] = avatarUrls
