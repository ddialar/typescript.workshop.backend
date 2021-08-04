import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from '@errors'

import { userDataSource } from '@infrastructure/dataSources'

import { testingUsers, testingExpiredJwtToken, testingValidJwtTokenForNonPersistedUser, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

const [{ username, password, email, token: validToken }] = testingUsers

const LOGOUT_PATH = '/logout'

describe('[API] - Authentication endpoints', () => {
  describe(`[POST] ${LOGOUT_PATH}`, () => {
    const { connect, disconnect } = mongodb
    const mockedUserData = {
      username,
      password,
      email,
      token: validToken
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

    it('returns OK (200) and the token field must be set to NULL in the user record', async () => {
      const token = `bearer ${validToken}`

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ text }) => {
          expect(text).toBe('User logged out successfully')

          const editedUser = (await getUserByUsernameFixture(username))!

          expect(editedUser.token).toBe('')
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async () => {
      const token = `bearer ${''}$`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async () => {
      const token = `bearer ${validToken}$`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it is not complete', async () => {
      const token = `bearer ${validToken.split('.').shift()}`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns UNAUTHORIZED (401) error when we send an expired token', async () => {
      const token = `bearer ${testingExpiredJwtToken}`
      const expectedErrorMessage = 'Token expired'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns FORBIDDEN (403) error when we do not provide any token', async () => {
      const token = ''
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(LOGOUT_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async () => {
      jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'updateUserById').mockRestore()
    })
  })
})
