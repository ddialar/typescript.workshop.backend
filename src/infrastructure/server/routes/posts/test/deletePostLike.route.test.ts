import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDto } from '@infrastructure/dtos'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingUsers,
  testingDtoFreeUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture,
  testingNonValidPostId
} from '@testingFixtures'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_LIKE_PATH}`, () => {
    const { connect, disconnect, models: { User, Post } } = mongodb

    const [selectedPost, emptyLikesPost] = testingLikedAndCommentedPersistedDtoPosts
    emptyLikesPost.likes = []

    const nonValidPostId = testingNonValidPostId

    const [{ userId: selectedLikeOwnerId }] = selectedPost.likes
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
      email: likeOwnerEmail
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
      email: freeUserEmail
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await User.insertMany([mockedPostLikeOwner, mockedUnauthorizedUserToBePersisted])
    })

    beforeEach(async () => {
      await cleanPostsCollectionFixture()
      await Post.insertMany([selectedPost, emptyLikesPost])
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and delete the provided like', async (done) => {
      const token = `bearer ${likeOwnerValidToken}`
      const { _id: postId } = selectedPost

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(async () => {
          const { likes: updatedDtoLikes } = (await Post.findById(postId))?.toJSON() as PostDto

          expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length - 1)
          expect(updatedDtoLikes.map(({ userId }) => userId).includes(selectedLikeOwnerId!)).toBeFalsy()
        })

      done()
    })

    it('must return OK (200) but not modify the selected post nor throw any error when the provided user has not liked the post', async (done) => {
      const token = `bearer ${noLikeOwnerToken}`
      const { _id: postId } = selectedPost!

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(async () => {
          const { likes: updatedDtoLikes } = (await Post.findById(postId))?.toJSON() as PostDto

          expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length)
        })

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { _id: postId } = selectedPost!
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
      const { _id: postId } = selectedPost!
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
      const { _id: postId } = selectedPost!
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
      const { _id: postId } = selectedPost!
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
