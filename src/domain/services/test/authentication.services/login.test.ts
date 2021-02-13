import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { verify, Secret } from 'jsonwebtoken'

import { userDataSource } from '@infrastructure/dataSources'
import { mongodb } from '@infrastructure/orm'
import * as token from '@infrastructure/authentication/token'
import { GettingTokenError, GettingUserError, WrongPasswordError, WrongUsernameError, UpdatingUserError, CheckingPasswordError } from '@errors'
import { testingUsers, testingValidPlainPassword, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

import { login } from '@domainServices'
import * as hashServices from '../../hash.services' // Just for mocking purposes
import { DecodedJwtToken } from '@infrastructure/types'

describe('[SERVICES] Authentication - login', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const secret: Secret = process.env.JWT_KEY!
  const [{ id: userId, username, password, email, name, surname, avatar }] = testingUsers
  const plainPassword = testingValidPlainPassword
  const mockedUserData: NewUserDatabaseDto & { _id: string } = {
    _id: userId,
    username,
    password,
    email,
    name,
    surname,
    avatar
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

  it('must authenticate the user and return a valid identification object', async (done) => {
    const { username } = mockedUserData
    const password = plainPassword

    const unauthenticatedUser = (await getUserByUsernameFixture(username))!

    expect(unauthenticatedUser.name).toBe(mockedUserData.name)
    expect(unauthenticatedUser.surname).toBe(mockedUserData.surname)
    expect(unauthenticatedUser.avatar).toBe(mockedUserData.avatar)

    expect(unauthenticatedUser.token).toBe('')
    expect(unauthenticatedUser.lastLoginAt).toBe('')

    const authenticationData = await login(username, password)

    expect(authenticationData.token).not.toBe('')

    const authenticatedUser = (await getUserByUsernameFixture(username))!

    expect(authenticatedUser.token).toBe(authenticationData.token)
    expect(authenticatedUser.lastLoginAt).not.toBe('')

    const verifiedToken = verify(authenticationData.token, secret) as DecodedJwtToken
    const expectedFields = ['exp', 'iat', 'sub', 'username']
    const retrievedTokenFields = Object.keys(verifiedToken).sort()
    expect(retrievedTokenFields.sort()).toEqual(expectedFields.sort())

    expect(verifiedToken.exp).toBeGreaterThan(0)
    expect(verifiedToken.iat).toBeGreaterThan(0)
    expect(verifiedToken.sub).toBe(userId)
    expect(verifiedToken.username).toBe(username)

    done()
  })

  it('must throw an UNAUTHORIZED (401) error when we use a non persisted username', async (done) => {
    const username = 'user@test.com'
    const password = plainPassword
    const expectedError = new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`)

    await expect(login(username, password)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw an UNAUTHORIZED (401) error when we use a wrong password', async (done) => {
    const { username } = mockedUserData
    const password = 'wr0np4$$w0rd'
    const expectedError = new WrongPasswordError(`Password missmatches for username '${username}'.`)

    await expect(login(username, password)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the retrieving user process fails', async (done) => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const password = plainPassword
    const expectedError = new GettingUserError(`Error retrieving user with username '${username}' login data. ${errorMessage}`)

    try {
      await login(username, password)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the checking password process fails', async (done) => {
    const { username } = mockedUserData
    const password = plainPassword
    const expectedError = new CheckingPasswordError('Error checking password.')

    jest.spyOn(hashServices, 'checkPassword').mockImplementation(() => {
      throw expectedError
    })

    try {
      await login(username, password)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(hashServices, 'checkPassword').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the getting token process fails', async (done) => {
    jest.spyOn(token, 'generateToken').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const password = plainPassword
    const expectedError = new GettingTokenError(`Error getting token for username '${username}'. ${errorMessage}`)

    try {
      await login(username, password)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(token, 'generateToken').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the updating login user data process fails', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { username } = mockedUserData
    const password = plainPassword
    const { _id: userId } = (await getUserByUsernameFixture(username))!
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' login data. ${errorMessage}`)

    try {
      await login(username, password)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
