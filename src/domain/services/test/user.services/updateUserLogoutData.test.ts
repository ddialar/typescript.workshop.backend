import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UpdatingUserError } from '@errors'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { updateUserLogoutData } from '@domainServices'

describe('[SERVICES] User - updateUserLogoutData', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [{ username, password, email, token }] = testingUsers
  const mockedUserData = {
    username,
    password,
    email,
    token
  }

  beforeAll(async () => {
    await connect()
    await cleanUsersCollectionFixture()
  })

  beforeEach(async () => {
    await cleanUsersCollectionFixture()
    await saveUserFixture(mockedUserData)
  })

  afterAll(async () => {
    await disconnect()
  })

  it('must update the user record setting the token field content to NULL', async () => {
    const { _id: userId, token } = (await getUserByUsernameFixture(username))!

    expect(token).toBe(mockedUserData.token)

    await updateUserLogoutData(userId)

    const updatedUser = (await getUserByUsernameFixture(username))!

    expect(updatedUser.token).toBe('')
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' logout data. ${errorMessage}`)

    try {
      await updateUserLogoutData(userId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()
  })
})
