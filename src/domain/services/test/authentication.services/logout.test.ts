import { userDataSource } from '@infrastructure/dataSources'
import { mongodb } from '@infrastructure/orm'
import { UpdatingUserError } from '@errors'
import { NewUserDomainModel } from '@domainModels'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { logout } from '@domainServices'

describe('[SERVICES] Authentication - logout', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const [{ username, password, email, name, surname, avatar, token }] = testingUsers
  const mockedUserData: NewUserDomainModel & { token: string } = {
    username,
    password,
    email,
    name,
    surname,
    avatar,
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

  it('must logout the user and remove the persisted token', async () => {
    const { username } = mockedUserData
    const authenticatedUser = (await getUserByUsernameFixture(username))!
    expect(authenticatedUser.token).toBe(token)

    const { _id: userId } = authenticatedUser
    await logout(userId)

    const unauthenticatedUser = (await getUserByUsernameFixture(username))!

    expect(unauthenticatedUser.token).toBe('')
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async () => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' logout data. ${errorMessage}`)

    try {
      await logout(userId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()
  })
})
