
import { random } from 'faker'
import mockedUsers from './assets/users.json'
import { avatarUrls } from './assets/avatarUrls.json'
import { UserDomainModel } from '@domainModels'

const generateRandomId = () => random.uuid().split('-').join('').slice(0, 24)

export const testingNonValidPostId = generateRandomId()
export const testingNonValidLikeOwnerId = generateRandomId()
export const testingNonValidUserId = generateRandomId()

export const testingNonPersistedUsername = 'non.persisted@mail.com'

export const testingUsers: UserDomainModel[] = mockedUsers
export const testingAvatarUrls: string[] = avatarUrls
