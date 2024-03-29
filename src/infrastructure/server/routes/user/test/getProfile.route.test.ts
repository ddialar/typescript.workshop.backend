import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { UserProfileDomainModel } from '@domainModels'
import { userDataSource } from '@infrastructure/dataSources'
import { UserProfileDto } from '@infrastructure/dtos'

import { testingUsers, testingValidJwtTokenForNonPersistedUser, testingExpiredJwtToken, cleanUsersCollectionFixture, saveUserFixture } from '@testingFixtures'

const [{ username, password, email, avatar, name, surname, token: validToken }] = testingUsers

interface TestingProfileDto extends UserProfileDto {
  password: string
  token: string
}

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

  describe(`[GET] ${PROFILE_PATH}`, () => {
    const mockedUserData: TestingProfileDto = {
      username,
      password,
      email,
      avatar,
      name,
      surname,
      token: validToken
    }

    beforeEach(async () => {
      await cleanUsersCollectionFixture()
      await saveUserFixture(mockedUserData)
    })

    afterEach(async () => {
      await cleanUsersCollectionFixture()
    })

    it('must return a 200 (OK) and the user\'s profile data', async () => {
      const token = `bearer ${validToken}`

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body }) => {
          const userProfile: UserProfileDomainModel = body
          const expectedFields = ['username', 'email', 'name', 'surname', 'avatar']

          const userProfileFields = Object.keys(userProfile).sort()
          expect(userProfileFields.sort()).toEqual(expectedFields.sort())

          expect(userProfile.username).toBe(mockedUserData.username)
          expect(userProfile.email).toBe(mockedUserData.email)
          expect(userProfile.name).toBe(mockedUserData.name)
          expect(userProfile.surname).toBe(mockedUserData.surname)
          expect(userProfile.avatar).toBe(mockedUserData.avatar)
        })
    })

    it('must return a FORBIDDEN (403) error when we send an empty token', async () => {
      const token = ''
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(PROFILE_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an UNAUTHORIZED (401) error when we send an expired token', async () => {
      const token = `bearer ${testingExpiredJwtToken}`
      const expectedErrorMessage = 'Token expired'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when we send an expired token', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async () => {
      jest.spyOn(userDataSource, 'getUserProfileById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .get(PROFILE_PATH)
        .set('Authorization', token)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(userDataSource, 'getUserProfileById').mockRestore()
    })
  })
})
