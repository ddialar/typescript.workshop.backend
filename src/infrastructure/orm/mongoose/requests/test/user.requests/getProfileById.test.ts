import { connect, disconnect } from '../../../core'
import { UserProfileDto } from '@infrastructure/dtos'

import { getProfileById } from '../../user.mongodb.requests'
import { testingUsers, testingNonValidUserId, cleanUsersCollection, saveUser, getUserByUsername } from '@testingFixtures'

const { username, password, email, avatar, name, surname } = testingUsers[0]

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
    await cleanUsersCollection()
    await saveUser(mockedUserData)
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  it('must not retrieve any provile using a non-existent user id', async (done) => {
    const userId = testingNonValidUserId
    const retrievedUserProfile = await getProfileById(userId)
    expect(retrievedUserProfile).toBeNull()

    done()
  })

  it('must retrieve selected user\'s profile', async (done) => {
    const { _id: userId } = await getUserByUsername(username)
    const retrievedUserProfile = await getProfileById(userId) as UserProfileDto

    const expectedFields = ['username', 'email', 'name', 'surname', 'avatar']
    const retrievedUserProfileFields = Object.keys(retrievedUserProfile).sort()
    expect(retrievedUserProfileFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUserProfile.username).toBe(mockedUserData.username)
    expect(retrievedUserProfile.email).toBe(mockedUserData.email)
    expect(retrievedUserProfile.name).toBe(mockedUserData.name)
    expect(retrievedUserProfile.surname).toBe(mockedUserData.surname)
    expect(retrievedUserProfile.avatar).toBe(mockedUserData.avatar)

    done()
  })
})
