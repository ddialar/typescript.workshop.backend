import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UpdatingUserError } from '@errors'
import { NewUserProfileDomainModel } from '@domainModels'
import { testingUsers, testingAvatarUrls, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { updateUserProfile } from '@domainServices'

describe('[SERVICES] User - updateUserProfile', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [avatarUrl] = testingAvatarUrls
  const [{ username, password, email, avatar, name, surname, token }] = testingUsers
  const mockedUserData = {
    username,
    password,
    email,
    avatar,
    name,
    surname,
    token
  }

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollectionFixture()
    await saveUserFixture(mockedUserData)
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  it('must update the user\'s profile and return the final result', async () => {
    const originalUser = (await getUserByUsernameFixture(username))!

    expect(originalUser.name).toBe(mockedUserData.name)
    expect(originalUser.surname).toBe(mockedUserData.surname)
    expect(originalUser.avatar).toBe(mockedUserData.avatar)

    const { _id: userId } = originalUser
    const newProfileData: NewUserProfileDomainModel = {
      name: 'Jane',
      surname: 'Doe',
      avatar: avatarUrl
    }

    const updatedProfile = (await updateUserProfile(userId, newProfileData))!

    expect(updatedProfile.username).toBe(originalUser.username)
    expect(updatedProfile.email).toBe(originalUser.email)

    expect(updatedProfile.name).toBe(newProfileData.name)
    expect(updatedProfile.surname).toBe(newProfileData.surname)
    expect(updatedProfile.avatar).toBe(newProfileData.avatar)
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(userDataSource, 'updateUserProfileById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const newProfileData: NewUserProfileDomainModel = {
      name: 'Jane',
      surname: 'Doe',
      avatar: avatarUrl
    }
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' profile. ${errorMessage}`)

    try {
      await updateUserProfile(userId, newProfileData)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'updateUserProfileById').mockRestore()
  })
})
