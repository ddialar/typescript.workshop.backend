import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UserProfileDomainModel } from '@domainModels'
import { GettingUserProfileError } from '@errors'
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

  it('must not retrieve any provile using a non-existent user id', async () => {
    const userId = testingNonValidUserId
    const retrievedUserProfile = await getUserProfile(userId)
    expect(retrievedUserProfile).toBeNull()
  })

  it('must retrieve selected user\'s profile', async () => {
    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const retrievedUserProfile = (await getUserProfile(userId))!

    const expectedFields = ['username', 'email', 'name', 'surname', 'avatar']
    const retrievedUserProfileFields = Object.keys(retrievedUserProfile).sort()
    expect(retrievedUserProfileFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUserProfile.username).toBe(mockedUserData.username)
    expect(retrievedUserProfile.email).toBe(mockedUserData.email)
    expect(retrievedUserProfile.name).toBe(mockedUserData.name)
    expect(retrievedUserProfile.surname).toBe(mockedUserData.surname)
    expect(retrievedUserProfile.avatar).toBe(mockedUserData.avatar)
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(userDataSource, 'getUserProfileById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const expectedError = new GettingUserProfileError(`Error retrieving profile for user ${userId}. ${errorMessage}`)

    try {
      await getUserProfile(userId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'getUserProfileById').mockRestore()
  })
})
