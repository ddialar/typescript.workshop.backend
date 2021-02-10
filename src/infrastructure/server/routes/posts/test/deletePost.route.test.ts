import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, FORBIDDEN, NOT_FOUND, BAD_REQUEST } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingExpiredJwtToken,
  testingValidJwtTokenForNonPersistedUser,
  testingDomainModelFreeUsers,
  testingUsers,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  getPostByIdFixture,
  testingNonValidPostId,
  savePostsFixture,
  saveUsersFixture
} from '@testingFixtures'

const POSTS_PATH = '/posts'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts
    const { id: selectedPostValidId } = selectedPost

    const nonValidPostId = testingNonValidPostId
    const expiredToken = testingExpiredJwtToken
    const unknownUserToken = testingValidJwtTokenForNonPersistedUser

    const {
      id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: ownerValidToken
    } = testingUsers.find(({ id }) => id === selectedPost.owner.id)!
    const mockedPostCommentOwner = {
      _id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail
    }

    const {
      id: unauthorizedId,
      username: unauthorizedUsername,
      password: unauthorizedPassword,
      email: unauthorizedEmail,
      token: unauthorizedValidToken
    } = testingUsers.find(({ id }) => id === testingDomainModelFreeUsers[0].id)!
    const mockedUnauthorizedUserToBePersisted = {
      _id: unauthorizedId,
      username: unauthorizedUsername,
      password: unauthorizedPassword,
      email: unauthorizedEmail
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await saveUsersFixture([mockedPostCommentOwner, mockedUnauthorizedUserToBePersisted])
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

    it('must return OK (200) and delete the provided post', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(async () => {
          const retrievedPost = await getPostByIdFixture(postId)

          expect(retrievedPost).toBeNull()
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId is not provided', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId is empty', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = ''
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has more characters than allowed ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId.concat('abcde')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has less characters than required ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId.substring(1)
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has non allowed characters', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId.substring(3).concat('$%#')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when the action is performed by an user who is not recorded in the database', async (done) => {
      const token = `bearer ${unknownUserToken}`
      const postId = selectedPostValidId
      const expectedErrorMessage = 'User does not exist'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) when the action is performed by an user with an expired token', async (done) => {
      const token = `bearer ${expiredToken}`
      const postId = selectedPostValidId
      const expectedErrorMessage = 'Token expired'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the post', async (done) => {
      const token = `bearer ${unauthorizedValidToken}`
      const postId = selectedPostValidId
      const expectedErrorMessage = 'User not authorized to delete this post'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return FORBIDDEN (403) when the sent token is empty', async (done) => {
      const token = ''
      const postId = selectedPostValidId
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return NOT_FOUND (404) when we select a post which does not exist', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = nonValidPostId
      const expectedErrorMessage = 'Post not found'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error retrieving the post', async (done) => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostById').mockRestore()

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'deletePost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPostValidId
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'deletePost').mockRestore()

      done()
    })
  })
})
