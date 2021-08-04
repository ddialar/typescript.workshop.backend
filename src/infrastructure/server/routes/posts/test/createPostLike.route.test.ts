import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  saveUserFixture,
  savePostsFixture,
  testingNonValidPostId
} from '@testingFixtures'
import { ExtendedPostDomainModel } from '@domainModels'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_LIKE_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const [selectedPostDto] = testingLikedAndCommentedPersistedDtoPosts
    const [selectedPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts
    const nonValidPostId = testingNonValidPostId
    const [{ id: testingFreeUserId }] = testingDomainModelFreeUsers
    const {
      id,
      username,
      password,
      email,
      avatar,
      name,
      surname,
      token: validToken
    } = testingUsers.find(({ id }) => id === testingFreeUserId)!

    const mockedUserDataToBePersisted = {
      _id: id,
      username,
      password,
      email,
      name,
      surname,
      avatar,
      token: validToken
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await saveUserFixture(mockedUserDataToBePersisted)
    })

    beforeEach(async () => {
      await cleanPostsCollectionFixture()
      await savePostsFixture([selectedPostDto])
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('returns OK (200) and the selected post including the new like', async () => {
      const token = `bearer ${validToken}`
      const { _id: postId } = selectedPostDto

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(({ body }) => {
          const likedPost: ExtendedPostDomainModel = body

          expect(likedPost.userHasLiked).toBeTruthy()
          expect(likedPost.likes).toStrictEqual([...selectedPostDomainModel.likes, { id, name, surname, avatar }])
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async () => {
      const token = `bearer ${''}$`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async () => {
      const token = `bearer ${validToken}$`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it is not complete', async () => {
      const token = `bearer ${validToken.split('.').shift()}`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we do not provide post ID', async () => {
      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we provide a wrong post ID that has more characters than allowed ones', async () => {
      const token = `bearer ${validToken}`
      const { _id: correctPostId } = selectedPostDto
      const postId = correctPostId.concat('abcde')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we provide a wrong post ID that has less characters than required ones', async () => {
      const token = `bearer ${validToken}`
      const { _id: correctPostId } = selectedPostDto
      const postId = correctPostId.substring(1)
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we provide a wrong post ID that has non allowed characters', async () => {
      const token = `bearer ${validToken}`
      const { _id: correctPostId } = selectedPostDto
      const postId = correctPostId.substring(3).concat('$%#')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns UNAUTHORIZED (401) error when we send an expired token', async () => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Token expired'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns a FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_LIKE_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns NOT_FOUND (404) when the provided post ID does nott exist', async () => {
      const token = `bearer ${validToken}`
      const postId = nonValidPostId
      const expectedErrorMessage = 'Post not found'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the retrieving post pocess throws an error', async () => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostById').mockRestore()
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the liking process throws an exception', async () => {
      jest.spyOn(postDataSource, 'likePost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { _id: postId } = selectedPostDto
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'likePost').mockRestore()
    })
  })
})
