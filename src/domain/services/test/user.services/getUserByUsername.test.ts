import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { NewUserDomainModel } from '@domainModels'
import { GettingUserError } from '@errors'
import { testingUsers, cleanUsersCollectionFixture, saveUserFixture } from '@testingFixtures'

import { getUserByUsername } from '@domainServices'

describe('[SERVICES] User - getUserByUsername', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [{ username, password, email, name, surname, avatar }] = testingUsers
  const mockedUserData: NewUserDomainModel = {
    username,
    password,
    email,
    name,
    surname,
    avatar
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

  it('must not retrieve any user', async () => {
    const username = 'user@test.com'
    const retrievedUser = await getUserByUsername(username)
    expect(retrievedUser).toBeNull()
  })

  it('must retrieve the persisted user', async () => {
    const newUserData: NewUserDomainModel = { ...mockedUserData }

    await saveUserFixture(newUserData)

    const username = newUserData.username
    const retrievedUser = (await getUserByUsername(username))!

    const expectedFields = ['id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt'].sort()
    expect(Object.keys(retrievedUser).sort()).toEqual(expectedFields)

    expect(retrievedUser.id).not.toBeNull()
    expect(retrievedUser.username).toBe(mockedUserData.username)
    expect(retrievedUser.password).toBe(mockedUserData.password)
    expect(retrievedUser.email).toBe(mockedUserData.email)
    expect(retrievedUser.name).toBe(mockedUserData.name)
    expect(retrievedUser.surname).toBe(mockedUserData.surname)
    expect(retrievedUser.avatar).toBe(mockedUserData.avatar)
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.token).toBe('')
    expect(retrievedUser.lastLoginAt).toBe('')
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const expectedError = new GettingUserError(`Error retrieving user with username '${username}' login data. ${errorMessage}`)

    try {
      await getUserByUsername(username)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()
  })
})
