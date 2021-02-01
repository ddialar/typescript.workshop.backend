import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from '@errors'

import { userDataSource } from '@infrastructure/dataSources'

import { testingUsers, testingExpiredJwtToken, testingValidJwtTokenForNonPersistedUser, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'
import { UserDto } from '@infrastructure/dtos'

const [{ username, password, email, token }] = testingUsers

const LOGOUT_PATH = '/logout'

describe('[API] - Authentication endpoints', () => {
  describe(`[POST] ${LOGOUT_PATH}`, () => {
    const { connect, disconnect } = mongodb
    const mockedUserData = {
      username,
      password,
      email,
      token
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

    it('must return a OK (200) and the token field must be set to NULL in the user record', async (done) => {
      const token = `bearer ${mockedUserData.token}`

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ text }) => {
          expect(text).toBe('User logged out successfully')

          const editedUser = await getUserByUsernameFixture(username) as UserDto

          expect(editedUser.token).toBe('')
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we send an expired token', async (done) => {
      const token = ''
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const expectedErrorMessage = 'Token expired'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async (done) => {
      jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${mockedUserData.token}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(LOGOUT_PATH)
        .set('Authorization', token)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'updateUserById').mockRestore()

      done()
    })
  })
})
