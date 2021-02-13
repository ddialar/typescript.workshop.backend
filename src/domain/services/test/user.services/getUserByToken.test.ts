import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { GettingUserError } from '@errors'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture, testingValidJwtTokenForNonPersistedUser } from '@testingFixtures'

import { getUserByToken } from '@domainServices'

describe('[SERVICES] User - getUserByToken', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [{ username, password, email, name, surname, avatar, token }] = testingUsers
  const mockedUserData = {
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
  })

  beforeEach(async () => {
    await cleanUsersCollectionFixture()
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  it('must not retrieve any user when we provide a non persisted token', async (done) => {
    const token = testingValidJwtTokenForNonPersistedUser
    const retrievedUser = await getUserByToken(token)
    expect(retrievedUser).toBeNull()

    done()
  })

  it('must retrieve the persisted user when we provided a persisted user', async (done) => {
    const newUserData = { ...mockedUserData }

    await saveUserFixture(newUserData)

    const token = newUserData.token
    const retrievedUser = (await getUserByToken(token))!

    const expectedFields = ['id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const retrievedUserFields = Object.keys(retrievedUser).sort()
    expect(retrievedUserFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUser.id).not.toBeNull()
    expect(retrievedUser.username).toBe(mockedUserData.username)
    expect(retrievedUser.password).toBe(mockedUserData.password)
    expect(retrievedUser.email).toBe(mockedUserData.email)
    expect(retrievedUser.name).toBe(mockedUserData.name)
    expect(retrievedUser.surname).toBe(mockedUserData.surname)
    expect(retrievedUser.avatar).toBe(mockedUserData.avatar)
    expect(retrievedUser.token).toBe(mockedUserData.token)
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.lastLoginAt).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'getUserByToken').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { token } = mockedUserData
    const expectedError = new GettingUserError(`Error retrieving user with token '${token}' login data. ${errorMessage}`)

    try {
      await getUserByToken(token)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'getUserByToken').mockRestore()

    done()
  })
})
