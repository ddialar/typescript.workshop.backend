import bcrypt, { compare } from 'bcrypt'
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

    const registeredUser = await createUser(newUserData)

    const expectedRegisteredFields = ['username', 'fullName']
    const registeredUserFields = Object.keys(registeredUser).sort()
    expect(registeredUserFields.sort()).toEqual(expectedRegisteredFields.sort())

    expect(registeredUser.username).toBe(newUserData.username)
    expect(registeredUser.fullName).toBe(`${newUserData.name} ${newUserData.surname}`)

    const persistedUser = (await getUserByUsernameFixture(username))!

    const expectedPersistedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const persistedUserFields = Object.keys(persistedUser).sort()
    expect(persistedUserFields.sort()).toEqual(expectedPersistedFields.sort())

    expect(persistedUser._id).not.toBeNull()
    expect(persistedUser.username).toBe(newUserData.username)
    expect(persistedUser.password).toMatch(/^\$[$/.\w\d]{59}$/)
    expect((await compare(newUserData.password, persistedUser.password))).toBeTruthy()
    expect(persistedUser.email).toBe(newUserData.email)
    expect(persistedUser.name).toBe(newUserData.name)
    expect(persistedUser.surname).toBe(newUserData.surname)
    expect(persistedUser.avatar).toBe(newUserData.avatar)
    expect(persistedUser.enabled).toBeTruthy()
    expect(persistedUser.deleted).toBeFalsy()
    expect(persistedUser.createdAt).not.toBeNull()
    expect(persistedUser.updatedAt).not.toBeNull()

    expect(persistedUser.token).toBe('')
    expect(persistedUser.lastLoginAt).toBe('')

    done()
  })

  it('must throw BAD_REQUEST (400) error when we try to persist the same username', async (done) => {
    const newUserData = { ...mockedUserData }
    const expectedError = new NewUserAlreadyExistsError(`User with username '${newUserData.username}' already exists.`)

    try {
      await createUser(newUserData)
      await createUser(newUserData)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the hashing password process throws an unexpected error', async (done) => {
    jest.mock('bcrypt')

    bcrypt.hash = jest.fn().mockImplementationOnce(() => { throw expectedError })

    const newUserData: NewUserDomainModel = { ...mockedUserData }
    const expectedError = new CreatingUserError(`Error updating user with username '${newUserData.username}' login data. ${errorMessage}`)

    try {
      await createUser(newUserData)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.mock('bcrypt').resetAllMocks()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'createUser').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const newUserData: NewUserDomainModel = { ...mockedUserData }
    const expectedError = new CreatingUserError(`Error updating user with username '${newUserData.username}' login data. ${errorMessage}`)

    try {
      await createUser(newUserData)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'createUser').mockRestore()

    done()
  })
})
