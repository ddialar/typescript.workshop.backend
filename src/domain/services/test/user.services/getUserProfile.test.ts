import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UserProfileDomainModel } from '@domainModels'
import { GettingUserError, GettingUserProfileError } from '@errors'
import { testingNonValidUserId, testingUsers, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { getUserProfile } from '@domainServices'

interface TestingProfileDomainModel extends UserProfileDomainModel {
  password: string
}

describe('[SERVICES] User - getUserProfile', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [{ username, password, email, avatar, name, surname }] = testingUsers
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
    await cleanUsersCollectionFixture()
    await saveUserFixture(mockedUserData)
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  it('must not retrieve any provile using a non-existent user id', async (done) => {
    const userId = testingNonValidUserId
    const retrievedUserProfile = await getUserProfile(userId)
    expect(retrievedUserProfile).toBeNull()

    done()
  })

  it('must retrieve selected user\'s profile', async (done) => {
    const { _id: userId } = await getUserByUsernameFixture(username)
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
      throw new GettingUserError(errorMessage)
    })

    const { _id: userId } = await getUserByUsernameFixture(username)
    const expectedError = new GettingUserProfileError(`Error retrieving profile for user ${userId}. ${errorMessage}`)

    await expect(getUserProfile(userId)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'getUserProfileById').mockRestore()

    done()
  })
})
