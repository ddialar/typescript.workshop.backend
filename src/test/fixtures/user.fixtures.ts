
import { random } from 'faker'
import mockedUsers from './assets/users.json'
import { avatarUrls } from './assets/avatarUrls.json'
import { UserDomainModel } from '@domainModels'

export const testingNonValidUserId = random.uuid().split('-').join('').slice(0, 24)
export const testingNonPersistedUsername = 'non.persisted@mail.com'

export const testingUsers: UserDomainModel[] = mockedUsers
export const testingAvatarUrls: string[] = avatarUrls
