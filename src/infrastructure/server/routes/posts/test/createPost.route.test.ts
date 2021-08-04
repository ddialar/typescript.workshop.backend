import supertest, { SuperTest, Test } from 'supertest'
import { lorem } from 'faker'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { ExtendedPostDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { UserProfileDto } from '@infrastructure/dtos'

import { testingUsers, testingValidJwtTokenForNonPersistedUser, testingExpiredJwtToken, cleanUsersCollectionFixture, cleanPostsCollectionFixture, saveUserFixture } from '@testingFixtures'

const [{ username, password, email, avatar, name, surname, token: validToken }] = testingUsers
interface TestingProfileDto extends UserProfileDto {
  password: string
  token: string
}

const POSTS_CREATE_PATH = '/posts'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_CREATE_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const postBody = lorem.paragraph()
    const mockedUserData: TestingProfileDto = {
      username,
      password,
      email,
      avatar,
      name,
      surname,
      token: validToken
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await saveUserFixture(mockedUserData)
    })

    beforeEach(async () => {
      await cleanPostsCollectionFixture()
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('returns OK (200) and the created post', async () => {
      const token = `bearer ${validToken}`
      const payload = { postBody }

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(OK)
        .then(async ({ body }) => {
          const createdPost: ExtendedPostDomainModel = body

          const expectedFields = ['id', 'body', 'owner', 'userIsOwner', 'userHasLiked', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
          expect(Object.keys(createdPost).sort()).toEqual(expectedFields)

          expect(createdPost.id).not.toBeNull()
          expect(createdPost.body).toBe(postBody)

          const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
          expect(Object.keys(createdPost.owner).sort()).toEqual(expectedPostOwnerFields)

          const postOwner = createdPost.owner
          expect(postOwner.id).not.toBeNull()
          expect(postOwner.name).toBe(mockedUserData.name)
          expect(postOwner.surname).toBe(mockedUserData.surname)
          expect(postOwner.avatar).toBe(mockedUserData.avatar)

          expect(createdPost.userIsOwner).toBeTruthy()
          expect(createdPost.userHasLiked).toBeFalsy()

          expect(createdPost.comments).toHaveLength(0)
          expect(createdPost.likes).toHaveLength(0)
          expect(createdPost.createdAt).not.toBeNull()
          expect(createdPost.updatedAt).not.toBeNull()
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async () => {
      const token = `bearer ${''}$`
      const payload = { postBody }
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async () => {
      const token = `bearer ${validToken}$`
      const payload = { postBody }
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it is not complete', async () => {
      const token = `bearer ${validToken.split('.').shift()}`
      const payload = { postBody }
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a token which belongs to a non registered user', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const payload = { postBody }
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when postBody is not sent', async () => {
      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'New post data error.'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when postBody is empty', async () => {
      const token = `bearer ${validToken}`
      const payload = { postBody: '' }
      const expectedErrorMessage = 'New post data error.'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns UNAUTHORIZED (401) error when we send an expired token', async () => {
      const token = `bearer ${testingExpiredJwtToken}`
      const payload = { postBody }
      const expectedErrorMessage = 'Token expired'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns FORBIDDEN (403) when we send an empty token', async () => {
      const token = ''
      const payload = { postBody }
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns a FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const payload = { postBody }
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_CREATE_PATH)
        .send(payload)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async () => {
      jest.spyOn(postDataSource, 'createPost').mockImplementation(() => Promise.resolve(null))

      const token = `bearer ${validToken}`
      const payload = { postBody }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPost').mockRestore()
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async () => {
      jest.spyOn(postDataSource, 'createPost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const payload = { postBody }
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send(payload)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPost').mockRestore()
    })
  })
})
