import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UpdatingUserError } from '@errors'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { updateUserLogoutData } from '@domainServices'
import { UserDto } from '@infrastructure/dtos'

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

  it('must update the user record setting the token field content to NULL', async (done) => {
    const { _id: userId, token } = await getUserByUsernameFixture(username) as UserDto

    expect(token).toBe(mockedUserData.token)

    await updateUserLogoutData(userId)

    const updatedUser = await getUserByUsernameFixture(username) as UserDto

    expect(updatedUser.token).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new UpdatingUserError(errorMessage)
    })

    const { _id: userId } = await getUserByUsernameFixture(username) as UserDto
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' logout data. ${errorMessage}`)

    await expect(updateUserLogoutData(userId)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
