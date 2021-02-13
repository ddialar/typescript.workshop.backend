import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN, BAD_REQUEST } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  saveUsersFixture,
  savePostsFixture,
  getPostByIdFixture
} from '@testingFixtures'

const POSTS_COMMENT_PATH = '/posts/comment'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_COMMENT_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const [selectedPost, nonValidPost] = testingLikedAndCommentedPersistedDomainModelPosts
    const [selectedComment] = selectedPost.comments
    const [nonValidPostComment] = nonValidPost.comments

    const {
      id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: ownerValidToken
    } = testingUsers.find(({ id }) => id === selectedComment.owner.id)!
    const mockedPostCommentOwner = {
      _id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: ownerValidToken
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
      await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and delete the provided comment', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(OK)
        .then(async () => {
          const { comments: updatedDtoComments } = (await getPostByIdFixture(postId))!

          expect(updatedDtoComments).toHaveLength(selectedPost.comments.length - 1)
          expect(updatedDtoComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()
        })

      done()
    })

    it('must return FORBIDDEN (403) when the sent token is empty', async (done) => {
      const token = `bearer ${''}`
      const postId = selectedPost.id
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const postId = selectedPost.id
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .delete(POSTS_COMMENT_PATH)
        .send({ postId, commentId })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return NOT_FOUND (404) when we select a post which doesn\'t contain the provided comment', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = nonValidPost.id
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment not found'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return NOT_FOUND (404) when provide a comment which is not contained into the selected post', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = nonValidPostComment.id
      const expectedErrorMessage = 'Post comment not found'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async (done) => {
      const token = `bearer ${unauthorizedValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id
      const expectedErrorMessage = 'User not authorized to delete this comment'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId is not provided', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId is empty', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = ''
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has more characters than allowed ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id.concat('abcde')
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has less characters than required ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id.substring(1)
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has non allowed characters', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id.substring(3).concat('$%#')
      const commentId = selectedComment.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when commentId is not provided', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when commentId is empty', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
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

      done()
    })

    it('must return BAD_REQUEST (400) when commentId has more characters than allowed ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id.concat('abcde')
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when commentId has less characters than required ones', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id.substring(1)
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when commentId has non allowed characters', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id.substring(3).concat('$%#')
      const expectedErrorMessage = 'Post comment data error.'

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id
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

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id
      const commentId = selectedComment.id
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

      done()
    })
  })
})
