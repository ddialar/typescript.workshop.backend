import { connect, disconnect } from '../../../core'
import { UserProfileDto } from '@infrastructure/dtos'

import { getProfileById } from '../../user.mongodb.requests'
import { testingUsers, testingNonValidUserId, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

const [{ username, password, email, avatar, name, surname }] = testingUsers

interface TestingProfileDto extends UserProfileDto {
  password: string
}

describe('[ORM] MongoDB - getProfileById', () => {
  const mockedUserData: TestingProfileDto = {
    username,
    password,
    email,
    avatar,
    name,
    surname
  }

  beforeAll(async () => {
    await connect()
    await cleanUsersCollectionFixture()
    await saveUserFixture(mockedUserData)
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  it('must not retrieve any provile using a non-existent user id', async () => {
    const userId = testingNonValidUserId
    const retrievedUserProfile = await getProfileById(userId)
    expect(retrievedUserProfile).toBeNull()
  })

  it('must retrieve selected user\'s profile', async () => {
    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const retrievedUserProfile = (await getProfileById(userId))!

    const expectedFields = ['username', 'email', 'name', 'surname', 'avatar']
    const retrievedUserProfileFields = Object.keys(retrievedUserProfile).sort()
    expect(retrievedUserProfileFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUserProfile.username).toBe(mockedUserData.username)
    expect(retrievedUserProfile.email).toBe(mockedUserData.email)
    expect(retrievedUserProfile.name).toBe(mockedUserData.name)
    expect(retrievedUserProfile.surname).toBe(mockedUserData.surname)
    expect(retrievedUserProfile.avatar).toBe(mockedUserData.avatar)
  })
})
