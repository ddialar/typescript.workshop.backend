import supertest, { SuperTest, Test } from 'supertest'
import { verify, Secret } from 'jsonwebtoken'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, GettingUserError, CheckingPasswordError } from '@errors'
import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { DecodedJwtToken, LoginInputParams } from '@infrastructure/types'
import { userDataSource } from '@infrastructure/dataSources'

import * as hashServices from '../../../../../domain/services/hash.services' // Just for mocking purposes
import * as token from '../../../../authentication/token' // Just for mocking purposes
import { testingUsers, testingNonPersistedUsername, testingValidPlainPassword, testingWrongPlainPassword, cleanUsersCollectionFixture, saveUserFixture } from '@testingFixtures'

const [{ id: userId, username: testingUsername, password, email, name, surname, avatar }] = testingUsers

const secret: Secret = process.env.JWT_KEY!
const LOGIN_PATH = '/login'

describe('[API] - Authentication endpoints', () => {
  describe(`[POST] ${LOGIN_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const mockedUserData: NewUserDatabaseDto & { _id: string } = {
      _id: userId,
      username: testingUsername,
      password,
      email,
      name,
      surname,
      avatar
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
    })

    beforeEach(async () => {
      await cleanUsersCollectionFixture()
      await saveUserFixture(mockedUserData)
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await disconnect()
    })

    it('must return a 200 (OK) and the user authentication data', async (done) => {
      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(OK)
        .then(async ({ body }) => {
          const expectedFields = ['token']
          const retrievedAuthenticationDataFields = Object.keys(body).sort()
          expect(retrievedAuthenticationDataFields.sort()).toEqual(expectedFields.sort())

          expect(body.token).not.toBe('')

          const verifiedToken = verify(body.token, secret) as DecodedJwtToken
          const expectedTokenFields = ['exp', 'iat', 'sub', 'username']
          const retrievedTokenFields = Object.keys(verifiedToken).sort()
          expect(retrievedTokenFields.sort()).toEqual(expectedTokenFields.sort())

          expect(verifiedToken.exp).toBeGreaterThan(0)
          expect(verifiedToken.iat).toBeGreaterThan(0)
          expect(verifiedToken.sub).toBe(userId)
          expect(verifiedToken.username).toBe(loginData.username)
        })

      done()
    })

    it('must throw an UNAUTHORIZED (401) error when we use a non persisted username', async (done) => {
      const loginData: LoginInputParams = {
        username: testingNonPersistedUsername,
        password: testingValidPlainPassword
      }
      const expectedErrorMessage = 'Username not valid'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must throw an UNAUTHORIZED (401) error when we use a wrong password', async (done) => {
      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingWrongPlainPassword
      }
      const expectedErrorMessage = 'Password not valid'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must throw an INTERNAL_SERVER_ERROR (500) when the retrieving user process fails', async (done) => {
      jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
        throw new GettingUserError('Testing error')
      })

      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()

      done()
    })

    it('must throw an INTERNAL_SERVER_ERROR (500) when the checking password process fails', async (done) => {
      jest.spyOn(hashServices, 'checkPassword').mockImplementation(() => {
        throw new CheckingPasswordError('Error checking password')
      })

      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(hashServices, 'checkPassword').mockRestore()

      done()
    })

    it('must throw an INTERNAL_SERVER_ERROR (500) when the getting token process fails', async (done) => {
      jest.spyOn(token, 'generateToken').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(token, 'generateToken').mockRestore()

      done()
    })

    it('must throw an INTERNAL_SERVER_ERROR (500) when the updating login user data process fails', async (done) => {
      jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const loginData: LoginInputParams = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'updateUserById').mockRestore()

      done()
    })
  })
})
