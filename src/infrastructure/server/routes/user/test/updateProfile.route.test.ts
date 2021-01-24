import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { userDataSource } from '@infrastructure/dataSources'
import { NewUserDatabaseDto, NewUserProfileDto, UserProfileDto } from '@infrastructure/dtos'

import { testingUsers, testingValidJwtTokenForNonPersistedUser, testingExpiredJwtToken, cleanUsersCollection, saveUser, getUserByUsername } from '@testingFixtures'

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
      await cleanUsersCollection()
      await saveUser(mockedUserData)
    })

    afterEach(async () => {
      await cleanUsersCollection()
    })

    it('must return a 200 (OK) and the user\'s profile data', async (done) => {
      const originalUser = await getUserByUsername(username)
      const token = `bearer ${validToken}`

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(OK)
        .then(async ({ body }) => {
          const userProfile = body as UserProfileDto
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
      const errorMessage = 'Required token was not provided'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return an UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const errorMessage = 'Token expired'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return an BAD_REQUEST (400) error when we send an expired token', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const errorMessage = 'User does not exist'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async (done) => {
      jest.spyOn(userDataSource, 'getUserProfileById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${validToken}`
      const errorMessage = 'Internal Server Error'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      jest.spyOn(userDataSource, 'getUserProfileById').mockRestore()

      done()
    })
  })
})
