import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { UserDomainModel, NewUserDomainModel } from '@domainModels'
import { GettingUserError } from '@errors'
import { testingUsers, cleanUsersCollection, saveUser } from '@testingFixtures'

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
    await cleanUsersCollection()
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  it('must not retrieve any user', async (done) => {
    const username = 'user@test.com'
    const retrievedUser = await getUserByUsername(username)
    expect(retrievedUser).toBeNull()

    done()
  })

  it('must retrieve the persisted user', async (done) => {
    const newUserData: NewUserDomainModel = { ...mockedUserData }

    await saveUser(newUserData)

    const username = newUserData.username
    const retrievedUser = await getUserByUsername(username) as UserDomainModel

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
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.token).toBe('')
    expect(retrievedUser.lastLoginAt).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new GettingUserError(errorMessage)
    })

    const { username } = mockedUserData
    const expectedError = new GettingUserError(`Error retrieving user with username '${username}' login data. ${errorMessage}`)

    await expect(getUserByUsername(username)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()

    done()
  })
})
