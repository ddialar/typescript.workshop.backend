import { compare } from 'bcrypt'
import { mongodb } from '@infrastructure/orm'
import { userDataSource } from '@infrastructure/dataSources'
import { NewUserDomainModel } from '@domainModels'
import { NewUserAlreadyExistsError, CreatingUserError } from '@errors'
import { testingUsers, cleanUsersCollectionFixture, getUserByUsernameFixture } from '@testingFixtures'

import { createUser } from '@domainServices'

describe('[SERVICES] User - createUser', () => {
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

  it('must persist the user successfully', async (done) => {
    const newUserData: NewUserDomainModel = { ...mockedUserData }

    await createUser(newUserData)

    const retrievedUser = (await getUserByUsernameFixture(username))!

    const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const retrievedUserFields = Object.keys(retrievedUser).sort()
    expect(retrievedUserFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUser._id).not.toBeNull()
    expect(retrievedUser.username).toBe(newUserData.username)
    expect(retrievedUser.password).toMatch(/^\$[$/.\w\d]{59}$/)
    expect((await compare(newUserData.password, retrievedUser.password))).toBeTruthy()
    expect(retrievedUser.email).toBe(newUserData.email)
    expect(retrievedUser.name).toBe(newUserData.name)
    expect(retrievedUser.surname).toBe(newUserData.surname)
    expect(retrievedUser.avatar).toBe(newUserData.avatar)
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.token).toBe('')
    expect(retrievedUser.lastLoginAt).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'createUser').mockImplementation(() => {
      throw new CreatingUserError(errorMessage)
    })

    const newUserData: NewUserDomainModel = { ...mockedUserData }
    const expectedError = new CreatingUserError(`Error updating user with username '${newUserData.username}' login data. ${errorMessage}`)

    await expect(createUser(newUserData)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'createUser').mockRestore()

    done()
  })

  it('must throw a BAD_REQUEST (400) error when we try to persist the same username', async (done) => {
    const newUserData = { ...mockedUserData }
    const expectedError = new NewUserAlreadyExistsError(`User with username '${newUserData.username}' already exists.`)

    await createUser(newUserData)
    await expect(createUser(newUserData)).rejects.toThrowError(expectedError)

    done()
  })
})
