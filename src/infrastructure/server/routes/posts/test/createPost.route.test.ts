import supertest, { SuperTest, Test } from 'supertest'
import { lorem } from 'faker'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { PostDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { UserProfileDto } from '@infrastructure/dtos'

import { testingUsers, testingValidJwtTokenForNonPersistedUser, testingExpiredJwtToken, cleanUsersCollectionFixture, cleanPostsCollectionFixture, saveUserFixture } from '@testingFixtures'

const [{ username, password, email, avatar, name, surname, token: validToken }] = testingUsers
interface TestingProfileDto extends UserProfileDto {
  password: string
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
      surname
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

    it('must return OK (200) and the created post', async (done) => {
      const token = `bearer ${validToken}`

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(OK)
        .then(async ({ body }) => {
          const createdPost: PostDomainModel = body

          const expectedFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
          const createdPostFields = Object.keys(createdPost).sort()
          expect(createdPostFields.sort()).toEqual(expectedFields.sort())

          expect(createdPost.id).not.toBeNull()
          expect(createdPost.body).toBe(postBody)

          const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar']
          const createdOwnerPostFields = Object.keys(createdPost.owner).sort()
          expect(createdOwnerPostFields.sort()).toEqual(expectedPostOwnerFields.sort())

          const postOwner = createdPost.owner
          expect(postOwner.id).not.toBeNull()
          expect(postOwner.name).toBe(mockedUserData.name)
          expect(postOwner.surname).toBe(mockedUserData.surname)
          expect(postOwner.avatar).toBe(mockedUserData.avatar)

          expect(createdPost.comments).toHaveLength(0)
          expect(createdPost.likes).toHaveLength(0)
          expect(createdPost.createdAt).not.toBeNull()
          expect(createdPost.updatedAt).not.toBeNull()
        })

      done()
    })

    it('must return FORBIDDEN (403) when we send an empty token', async (done) => {
      const token = ''
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const expectedErrorMessage = 'Token expired'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send an expired token', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
      jest.spyOn(postDataSource, 'createPost').mockImplementation(() => Promise.resolve(null))

      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPost').mockRestore()

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'createPost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_CREATE_PATH)
        .set('Authorization', token)
        .send({ postBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPost').mockRestore()

      done()
    })
  })
})
