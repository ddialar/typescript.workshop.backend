import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { userDataSource } from '@infrastructure/dataSources'
import { UserProfileDto } from '@infrastructure/dtos'

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
    const mockedUserData = {
      username,
      password,
      email,
      name,
      surname,
      avatar,
      token: validToken
    }

    const profileData = {
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

    it('must return a OK (200) and the user\'s profile updated data when the whole allowed fields are provided', async () => {
      const originalUser = (await getUserByUsernameFixture(username))!
      const token = `bearer ${validToken}`
      const payload = { ...profileData }

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
    })

    it('must return a OK (200) and the user\'s profile updated data when only the name field is updated', async () => {
      const originalUser = (await getUserByUsernameFixture(username))!
      const token = `bearer ${validToken}`
      const payload = { name: profileData.name }

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
          expect(userProfile.surname).toBe(originalUser.surname)
          expect(userProfile.avatar).toBe(originalUser.avatar)

          expect(userProfile.name).toBe(payload.name)
        })
    })

    it('must return a OK (200) and the user\'s profile updated data when only the surname field is updated', async () => {
      const originalUser = (await getUserByUsernameFixture(username))!
      const token = `bearer ${validToken}`
      const payload = { surname: profileData.surname }

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
          expect(userProfile.name).toBe(originalUser.name)
          expect(userProfile.avatar).toBe(originalUser.avatar)

          expect(userProfile.surname).toBe(payload.surname)
        })
    })

    it('must return a OK (200) and the user\'s profile updated data when only the avatar field is updated', async () => {
      const originalUser = (await getUserByUsernameFixture(username))!
      const token = `bearer ${validToken}`
      const payload = { avatar: profileData.avatar }

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
          expect(userProfile.name).toBe(originalUser.name)
          expect(userProfile.surname).toBe(originalUser.surname)

          expect(userProfile.avatar).toBe(payload.avatar)
        })
    })

    it('must return a FORBIDDEN (403) error when we send an expired token', async () => {
      const token = ''
      const payload = { ...profileData }
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const payload = { ...profileData }
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .put(PROFILE_PATH)
        .send(payload)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an UNAUTHORIZED (401) error when we send an expired token', async () => {
      const token = `bearer ${testingExpiredJwtToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Token expired'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when we send a token that belongs to a non recorded user', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'User does not exist'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when we send nothing as profile data', async () => {
      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Empty profile data not allowed'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when the provided name has not the minimum amount of characters', async () => {
      const token = `bearer ${validToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Profile data error'

      payload.name = 'J'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when the provided surname has not the minimum amount of characters', async () => {
      const token = `bearer ${validToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Profile data error'

      payload.surname = 'J'

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when the provided avatar is an empty string', async () => {
      const token = `bearer ${validToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Profile data error'

      payload.avatar = ''

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when the provided avatar has a schema different to http or https', async () => {
      const token = `bearer ${validToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Profile data error'

      payload.avatar = payload.avatar.replace('https', 'git')

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an BAD_REQUEST (400) error when the provided avatar has less than two domains', async () => {
      const token = `bearer ${validToken}`
      const payload = { ...profileData }
      const expectedErrorMessage = 'Profile data error'

      payload.avatar = payload.avatar.replace('cdn.icon-icons.', '')

      await request
        .put(PROFILE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('must return an INTERNAL_SERVER_ERROR (500) when the updating process fails', async () => {
      jest.spyOn(userDataSource, 'updateUserProfileById').mockImplementation(() => {
        throw new Error('Testing Error')
      })

      const token = `bearer ${validToken}`
      const payload = { ...profileData }
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
    })
  })
})
