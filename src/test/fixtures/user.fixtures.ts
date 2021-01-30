
import { random } from 'faker'
import mockedUsers from './assets/users.json'
import { avatarUrls } from './assets/avatarUrls.json'

export const testingNonValidUserId = random.uuid().split('-').join('').slice(0, 24)
export const testingNonPersistedUsername = 'non.persisted@mail.com'

// TODO Use type annotation before assigninig the JSON values in order to ensure a corect typing.
/**
export interface UserDomainModel {
  id: string
  username: string
  password: string
  email: string
  name: string | null
  surname: string | null
  avatar: string | null
  token: string | null
  enabled: boolean
  deleted: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}
type FixturedUser = Omit<UserDomainModel, 'createdAt' | 'updatedAt'>
export const testingUsers: FixturedUser = mockedUsers
*/
export const testingUsers = mockedUsers
export const testingAvatarUrls = avatarUrls
