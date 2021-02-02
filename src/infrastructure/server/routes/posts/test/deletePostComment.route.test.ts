import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { PostDomainModel, UserDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDto } from '@infrastructure/dtos'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture
} from '@testingFixtures'

const POSTS_COMMENT_PATH = '/posts/comment'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_COMMENT_PATH}`, () => {
    const { connect, disconnect, models: { User, Post } } = mongodb

    const [selectedPost, nonValidPost] = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
    const [selectedComment] = selectedPost.comments
    const [nonValidPostComment] = nonValidPost.comments

    const {
      id: ownerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: ownerValidToken
    } = testingUsers.find(({ id }) => id === selectedComment.owner.id) as UserDomainModel
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
    } = testingUsers.find(({ id }) => id === testingDomainModelFreeUsers[0].id) as UserDomainModel
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
      await User.insertMany([mockedPostCommentOwner, mockedUnauthorizedUserToBePersisted])
    })

    beforeEach(async () => {
      await cleanPostsCollectionFixture()
      await Post.insertMany(testingLikedAndCommentedPersistedDtoPosts)
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and delete the provided comment', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id as string
      const commentId = selectedComment.id as string

      await request
        .delete(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentId })
        .expect(OK)
        .then(async () => {
          const { comments: updatedDtoComments } = (await Post.findById(postId))?.toJSON() as PostDto

          expect(updatedDtoComments).toHaveLength(selectedPost.comments.length - 1)
          expect(updatedDtoComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()
        })

      done()
    })

    it('must return NOT_FOUND (404) when we select a post which doesn\'t contain the provided comment', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = nonValidPost.id as string
      const commentId = selectedComment.id as string
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
      const postId = selectedPost.id as string
      const commentId = nonValidPostComment.id as string
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
      const postId = selectedPost.id as string
      const commentId = selectedComment.id as string
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

    it('must return INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
      jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id as string
      const commentId = selectedComment.id as string
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
      const postId = selectedPost.id as string
      const commentId = selectedComment.id as string
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
