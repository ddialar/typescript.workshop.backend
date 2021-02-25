import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingUsers,
  testingDtoFreeUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  testingNonValidPostId,
  saveUsersFixture,
  savePostsFixture,
  testingLikedAndCommentedPersistedDomainModelPosts
} from '@testingFixtures'
import { ExtendedPostDomainModel } from '@domainModels'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_LIKE_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const [selectedPostDto] = testingLikedAndCommentedPersistedDtoPosts
    const [selectedPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts

    const nonValidPostId = testingNonValidPostId

    const [{ userId: selectedLikeOwnerId }] = selectedPostDto.likes
    const {
      username: likeOwnerUsername,
      password: likeOwnerPassword,
      email: likeOwnerEmail,
      token: likeOwnerValidToken
    } = testingUsers.find(({ id }) => id === selectedLikeOwnerId)!
    const mockedPostLikeOwner = {
      _id: selectedLikeOwnerId,
      username: likeOwnerUsername,
      password: likeOwnerPassword,
      email: likeOwnerEmail,
      token: likeOwnerValidToken
    }

    const [{ userId: freeUserId }] = testingDtoFreeUsers
    const {
      username: freeUserUsername,
      password: freeUserPassword,
      email: freeUserEmail,
      token: noLikeOwnerToken
    } = testingUsers.find(({ id }) => id === freeUserId)!
    const mockedUnauthorizedUserToBePersisted = {
      _id: freeUserId,
      username: freeUserUsername,
      password: freeUserPassword,
      email: freeUserEmail,
      token: noLikeOwnerToken
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await saveUsersFixture([mockedPostLikeOwner, mockedUnauthorizedUserToBePersisted])
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

    it('must return OK (200) and delete the provided like', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const { _id: postId } = selectedPostDto

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(({ body }) => {
          const { userHasLiked, likes }: ExtendedPostDomainModel = body

          expect(userHasLiked).toBeFalsy()
          expect(likes).toStrictEqual(selectedPostDomainModel.likes.filter(({ id }) => id !== mockedPostLikeOwner._id))
        })

      done()
    })

    it('must return OK (200) but not modify the selected post nor throw any error when the provided user has not liked the post', async (done) => {
      const token = `bearer ${noLikeOwnerToken}`
      const { _id: postId } = selectedPostDto!

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(({ body }) => {
          const { userHasLiked, likes }: ExtendedPostDomainModel = body

          expect(userHasLiked).toBeFalsy()
          expect(likes).toStrictEqual(selectedPostDomainModel.likes)
        })

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'Token expired'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a token of non recorded user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'User does not exist'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async (done) => {
      const token = `bearer ${likeOwnerValidToken}$`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a BAD_REQUEST (400) error when we send a wrong formatted token because it is incomplete', async (done) => {
      const token = `bearer ${likeOwnerValidToken.split('.').shift()}`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return FORBIDDEN (403) when the sent token is empty', async (done) => {
      const token = `bearer ${''}`
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_LIKE_PATH)
        .send({ postId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we do not provide post ID', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we provide a wrong post ID that has more characters than allowed ones', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const { _id: originalPostId } = selectedPostDto
      const postId = originalPostId.concat('abcde')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we provide a wrong post ID that has less characters than required ones', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const { _id: originalPostId } = selectedPostDto
      const postId = originalPostId.substring(1)
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return NOT_FOUND (404) when the provided post ID doesn\'t exist', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const postId = nonValidPostId
      const expectedErrorMessage = 'Post not found'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the datasource retrieving post by ID process throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${likeOwnerValidToken}`
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostById').mockRestore()

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the datasource disliking process throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'dislikePost').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${likeOwnerValidToken}`
      const { _id: postId } = selectedPostDto!
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'dislikePost').mockRestore()

      done()
    })
  })
})
