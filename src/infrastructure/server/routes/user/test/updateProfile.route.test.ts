import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { userDataSource } from '@infrastructure/dataSources'
import { NewUserDatabaseDto, NewUserProfileDto, UserDto, UserProfileDto } from '@infrastructure/dtos'

import { testingUsers, testingValidJwtTokenForNonPersistedUser, testingExpiredJwtToken, cleanUsersCollectionFixture, saveUserFixture, getUserByUsernameFixture } from '@testingFixtures'

const [{ username, password, email, avatar, name, surname, token: validToken }] = testingUsers

const PROFILE_PATH = '/profile'

describe('[API] - User endpoints', () => {
  const { connect, disconnect } = mongodb

  let request: SuperTest<Test>

  beforeAll(async () => {
    request = supertest(server)
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe(`[PUT] ${PROFILE_PATH}`, () => {
    const mockedUserData: NewUserDatabaseDto = {
      username,
      password,
      email,
      name,
      surname,
      avatar
    }

    const payload: NewUserProfileDto = {
      avatar,
      name,
      surname
    }

    beforeEach(async () => {
      await cleanUsersCollectionFixture()
      await saveUserFixture(mockedUserData)
    })

    afterEach(async () => {
      await cleanUsersCollectionFixture()
    })

    it('must return a OK (200) and the user\'s profile data', async (done) => {
      const originalUser = (await getUserByUsernameFixture(username))!
      const token = `bearer ${validToken}`

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(OK)
        .then(async ({ body }) => {
          const userProfile: UserProfileDto = body
          const expectedFields = ['username', 'email', 'name', 'surname', 'avatar']

          const userProfileFields = Object.keys(userProfile).sort()
          expect(userProfileFields.sort()).toEqual(expectedFields.sort())

          expect(userProfile.username).toBe(originalUser.username)
          expect(userProfile.email).toBe(originalUser.email)

          expect(userProfile.name).toBe(payload.name)
          expect(userProfile.surname).toBe(payload.surname)
          expect(userProfile.avatar).toBe(payload.avatar)
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we send an expired token', async (done) => {
      const token = ''
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
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
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an BAD_REQUEST (400) error when we send an expired token', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an INTERNAL_SERVER_ERROR (500) when the updating process fails', async (done) => {
      jest.spyOn(userDataSource, 'updateUserProfileById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'updateUserProfileById').mockRestore()

      done()
    })
  })
})
