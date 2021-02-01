import { userDataSource } from '@infrastructure/dataSources'
import { mongodb } from '@infrastructure/orm'
import { UpdatingUserError } from '@errors'
import { NewUserDomainModel } from '@domainModels'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { logout } from '@domainServices'
import { UserDto } from '@infrastructure/dtos'

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

  it('must logout the user and remove the persisted token', async (done) => {
    const { username } = mockedUserData
    const authenticatedUser = await getUserByUsernameFixture(username) as UserDto
    expect(authenticatedUser.token).toBe(token)

    const { _id: userId } = authenticatedUser
    await logout(userId)

    const unauthenticatedUser = await getUserByUsernameFixture(username) as UserDto

    expect(unauthenticatedUser.token).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const { _id: userId } = await getUserByUsernameFixture(username) as UserDto
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' logout data. ${errorMessage}`)

    await expect(logout(userId)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
