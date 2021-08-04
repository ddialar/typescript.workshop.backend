import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN, BAD_REQUEST } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  saveUsersFixture,
  savePostsFixture,
  testingExpiredJwtToken,
  testingValidJwtTokenForNonPersistedUser
} from '@testingFixtures'
import { ExtendedPostDomainModel } from '@domainModels'

const POSTS_COMMENT_PATH = '/posts/comment'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_COMMENT_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const [selectedPostDto, nonValidPostDto] = testingLikedAndCommentedPersistedDtoPosts
    const { _id: selectedPostId, comments: selectedPostDtoComments } = selectedPostDto
    const [{ _id: selectedCommentId, owner: { userId: selectedCommentOwnerId } }] = selectedPostDtoComments

    const { _id: nonValidPostId, comments: nonValidPostComments } = nonValidPostDto
    const [{ _id: nonValidPostCommentId }] = nonValidPostComments

    const expiredToken = testingExpiredJwtToken

    const {
      id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: validToken
    } = testingUsers.find(({ id }) => id === selectedCommentOwnerId)!
    const mockedPostCommentOwner = {
      _id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: validToken
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
      email: unauthorizedEmail,
      token: unauthorizedValidToken
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
      await savePostsFixture([selectedPostDto])
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('returns OK (200) and delete the provided comment', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(OK)
        .then(({ body }) => {
          const { comments: updatedDtoComments }: ExtendedPostDomainModel = body

          expect(updatedDtoComments).toHaveLength(selectedPostDtoComments.length - 1)
          expect(updatedDtoComments.map(({ id }) => id).includes(commentId)).toBeFalsy()
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async () => {
      const token = `bearer ${''}$`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Wrong token format'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async () => {
      const token = `bearer ${validToken}$`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Wrong token format'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it is not complete', async () => {
      const token = `bearer ${validToken.split('.').shift()}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Wrong token format'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async () => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'User does not exist'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when postId is not provided', async () => {
      const token = `bearer ${validToken}`
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when postId is empty', async () => {
      const token = `bearer ${validToken}`
      const postId = ''
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when postId has more characters than allowed ones', async () => {
      const token = `bearer ${validToken}`
      const { _id: rawPostId } = selectedPostDto
      const postId = rawPostId.concat('abcd')
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when postId has less characters than required ones', async () => {
      const token = `bearer ${validToken}`
      const { _id: rawPostId } = selectedPostDto
      const postId = rawPostId.substring(1)
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when postId has non allowed characters', async () => {
      const token = `bearer ${validToken}`
      const { _id: rawPostId } = selectedPostDto
      const postId = rawPostId.substring(3).concat('$%')
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when commentId is not provided', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when commentId is empty', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = ''
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when commentId has more characters than allowed ones', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId.concat('abcde')
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when commentId has less characters than required ones', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId.substring(1)
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns BAD_REQUEST (400) when commentId has non allowed characters', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId.substring(3).concat('$%#')
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns UNAUTHORIZED (401) when the action is performed by an user with an expired token', async () => {
      const token = `bearer ${expiredToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Token expired'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns UNAUTHORIZED (401) when the action is performed by an user who is not the comment owner', async () => {
      const token = `bearer ${unauthorizedValidToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'User not authorized to delete this comment'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns FORBIDDEN (403) when the sent token is empty', async () => {
      const token = `bearer ${''}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns FORBIDDEN (403) error when we do not provide the authorization header', async () => {
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_COMMENT_PATH)
        .send({ postId, commentId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns NOT_FOUND (404) when we select a post that does not exist', async () => {
      const token = `bearer ${validToken}`
      const postId = nonValidPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Post not found'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns NOT_FOUND (404) when select a comment which is not contained into the selected post', async () => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = nonValidPostCommentId
      const expectedErrorMessage = 'Post comment not found'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
      jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostComment').mockRestore()
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async () => {
      jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentId = selectedCommentId
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'deletePostComment').mockRestore()
    })
  })
})
