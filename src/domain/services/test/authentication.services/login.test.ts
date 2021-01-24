import { userDataSource } from '@infrastructure/dataSources'
import { mongodb } from '@infrastructure/orm'
import * as token from '@infrastructure/authentication/token'
import { GettingTokenError, GettingUserError, WrongPasswordError, WrongUsernameError, UpdatingUserError, CheckingPasswordError } from '@errors'
import { NewUserDomainModel } from '@domainModels'
import { testingUsers, testingValidPlainPassword, cleanUsersCollection, saveUser, getUserByUsername } from '@testingFixtures'

import { login } from '@domainServices'
import * as hashServices from '../../hash.services' // Just for mocking purposes

const [{ username, password, email, name, surname, avatar }] = testingUsers

describe('[SERVICES] Authentication - login', () => {
  const { connect, disconnect } = mongodb
  const plainPassword = testingValidPlainPassword
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
    await cleanUsersCollection()
  })

  beforeEach(async () => {
    await cleanUsersCollection()
    await saveUser(mockedUserData)
  })

  afterAll(async () => {
    await disconnect()
  })

  it('must authenticate the user and return a valid identification object', async (done) => {
    const { username } = mockedUserData
    const password = plainPassword

    const unauthenticatedUser = await getUserByUsername(username)

    expect(unauthenticatedUser.name).toBe(mockedUserData.name)
    expect(unauthenticatedUser.surname).toBe(mockedUserData.surname)
    expect(unauthenticatedUser.avatar).toBe(mockedUserData.avatar)

    expect(unauthenticatedUser.token).toBe('')
    expect(unauthenticatedUser.lastLoginAt).toBe('')

    const authenticationData = await login(username, password)

    expect(authenticationData.token).not.toBe('')

    const authenticatedUser = await getUserByUsername(username)

    expect(authenticatedUser.token).toBe(authenticationData.token)
    expect(authenticatedUser.lastLoginAt).not.toBe('')

    done()
  })

  it('must throw an UNAUTHORIZED (401) error when we use a non persisted username', async (done) => {
    const username = 'user@test.com'
    const password = plainPassword

    await expect(login(username, password)).rejects.toThrowError(new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`))

    done()
  })

  it('must throw an UNAUTHORIZED (401) error when we use a wrong password', async (done) => {
    const { username } = mockedUserData
    const password = 'wr0np4$$w0rd'

    await expect(login(username, password)).rejects.toThrowError(new WrongPasswordError(`Password missmatches for username '${username}'.`))

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the retrieving user process fails', async (done) => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new GettingUserError('Testing error')
    })

    const { username } = mockedUserData
    const password = plainPassword

    try {
      await login(username, password)
    } catch (error) {
      expect(error).toStrictEqual(new GettingUserError(`Error retrieving user with username '${username}' login data. ${error.message}`))
    }

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the checking password process fails', async (done) => {
    jest.spyOn(hashServices, 'checkPassword').mockImplementation(() => {
      throw new CheckingPasswordError('Error checking password')
    })

    const { username } = mockedUserData
    const password = plainPassword

    try {
      await login(username, password)
    } catch (error) {
      expect(error).toStrictEqual(new CheckingPasswordError(`Error checking password. ${error.message}`))
    }

    jest.spyOn(hashServices, 'checkPassword').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the getting token process fails', async (done) => {
    jest.spyOn(token, 'generateToken').mockImplementation(() => {
      throw new Error('Testing Error')
    })

    const { username } = mockedUserData
    const password = plainPassword

    try {
      await login(username, password)
    } catch (error) {
      expect(error).toStrictEqual(new GettingTokenError(`Error getting token for username '${username}'. ${error.message}`))
    }

    jest.spyOn(token, 'generateToken').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the updating login user data process fails', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new Error('Testing Error')
    })

    const { username } = mockedUserData
    const password = plainPassword

    const { _id: userId } = await getUserByUsername(username)

    try {
      await login(username, password)
    } catch (error) {
      expect(error).toStrictEqual(new UpdatingUserError(`Error updating user '${userId}' login data. ${error.message}`))
    }

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
