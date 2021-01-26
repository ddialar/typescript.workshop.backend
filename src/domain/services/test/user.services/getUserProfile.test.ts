import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UserDomainModel, UserProfileDomainModel } from '@domainModels'
import { GettingUserError, GettingUserProfileError } from '@errors'
import { testingNonValidUserId, testingUsers, cleanUsersCollection, saveUser } from '@testingFixtures'

import { getUserProfile } from '@domainServices'
import { UserDto } from '@infrastructure/dtos'

const [{ username, password, email, avatar, name, surname }] = testingUsers

interface TestingProfileDomainModel extends UserProfileDomainModel {
  password: string
}

describe('[SERVICES] User - getUserProfile', () => {
  const { connect, disconnect, models: { User } } = mongodb

  const mockedUserData: TestingProfileDomainModel = {
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
    const retrievedUserProfile = await getUserProfile(userId)
    expect(retrievedUserProfile).toBeNull()

    done()
  })

  it('must retrieve selected user\'s profile', async (done) => {
    const { _id: userId } = (await User.findOne({ username }))?.toJSON() as UserDto
    const retrievedUserProfile = await getUserProfile(userId) as UserProfileDomainModel

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

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'getUserProfileById').mockImplementation(() => {
      throw new GettingUserError('Testing error')
    })

    const { id: userId } = (await User.findOne({ username }))?.toJSON() as UserDomainModel

    try {
      await getUserProfile(userId)
    } catch (error) {
      expect(error).toStrictEqual(new GettingUserProfileError(`Error retrieving profile for user ${userId}. ${error.message}`))
    }

    jest.spyOn(userDataSource, 'getUserProfileById').mockRestore()

    done()
  })
})
