import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'
import { UserProfileDto } from '@infrastructure/dtos'

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
  getPostByIdFixture,
  testingNonValidPostId
} from '@testingFixtures'
import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_LIKE_PATH}`, () => {
    interface TestingProfileDto extends UserProfileDto {
      _id: string
      password: string
      token: string
    }

    const { connect, disconnect } = mongodb

    const [originalPost] = testingLikedAndCommentedPersistedDomainModelPosts
    const nonValidPostId = testingNonValidPostId
    const [testingFreeUser] = testingDomainModelFreeUsers
    const { id, username, password, email, avatar, name, surname, token: validToken } = testingUsers.find(({ id }) => id === testingFreeUser.id)!

    const mockedUserDataToBePersisted: TestingProfileDto = {
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
      await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and persist the new like into the selected post', async (done) => {
      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const likeOwner = testingFreeUser

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(async () => {
          const updatedPost = mapPostFromDtoToDomainModel((await getPostByIdFixture(postId))!)

          expect(updatedPost.id).not.toBeNull()
          expect(updatedPost.body).toBe(originalPost.body)
          expect(updatedPost.owner).toStrictEqual(originalPost.owner)
          expect(updatedPost.comments).toStrictEqual(originalPost.comments)

          expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
          const originalLikesIds = originalPost.likes.map(({ id }) => id.toString())
          const updatedLikesIds = updatedPost.likes.map(({ id }) => id.toString())
          const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
          const newPersistedLike = updatedPost.likes.find((like) => like.id === newLikeId)!
          expect(newPersistedLike.id).toBe(likeOwner.id)
          expect(newPersistedLike.name).toBe(likeOwner.name)
          expect(newPersistedLike.surname).toBe(likeOwner.surname)
          expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

          expect(updatedPost.createdAt).toBe(originalPost.createdAt)
          expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

          expect(updatedPost.createdAt).toBe(originalPost.createdAt)
          expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)
        })

      done()
    })

    it('must return NOT_FOUND (404) when the provided post ID doesn\'t exist', async (done) => {
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

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { id: postId } = originalPost
      const expectedErrorMessage = 'Token expired'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_LIKE_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a token of non recorded user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const { id: postId } = originalPost
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we do not provide post ID', async (done) => {
      const token = `bearer ${validToken}`
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we provide a wrong post ID that has more characters than allowed ones', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.concat('abcde')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we provide a wrong post ID that has less characters than required ones', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.substring(1)
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we provide a wrong post ID that has non allowed characters', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.substring(3).concat('$%#')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .post(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the retrieving post pocess throws an error', async (done) => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
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

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the liking process throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'likePost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
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

      done()
    })
  })
})
