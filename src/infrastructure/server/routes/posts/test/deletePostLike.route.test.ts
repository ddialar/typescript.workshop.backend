import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { PostDomainModel, UserDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDto } from '@infrastructure/dtos'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollectionFixture,
  cleanPostsCollectionFixture
} from '@testingFixtures'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[DELETE] ${POSTS_LIKE_PATH}`, () => {
    const { connect, disconnect, models: { User, Post } } = mongodb

    const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
    const mockedCompleteDtoPost = JSON.parse(JSON.stringify(mockedDtoPosts[0]))
    const mockedEmptyLikesDtoPost = JSON.parse(JSON.stringify(mockedDtoPosts[1]))
    mockedEmptyLikesDtoPost.likes = []

    const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
    const selectedPost = resultPosts[0]
    const selectedLike = selectedPost.likes[0]
    const selectedLikeOwnerId = selectedLike.id
    const mockedNonValidPostId = resultPosts[1].owner.id as string
    const mockedNoLikerUserId = resultPosts[1].owner.id as string

    const {
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail,
      token: ownerValidToken
    } = testingUsers.find(({ id }) => id === selectedLikeOwnerId) as UserDomainModel
    const mockedPostLikeOwner = {
      _id: selectedLikeOwnerId,
      username: ownerUsername,
      password: ownerPassword,
      email: ownerEmail
    }

    const {
      username: noLikerUsername,
      password: noLikerUserPassword,
      email: noLikerUserEmail,
      token: noLikerUserValidToken
    } = testingUsers.find(({ id }) => id === mockedNoLikerUserId) as UserDomainModel
    const mockedUnauthorizedUserToBePersisted = {
      _id: mockedNoLikerUserId,
      username: noLikerUsername,
      password: noLikerUserPassword,
      email: noLikerUserEmail
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
      await Post.insertMany([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and delete the provided comment', async (done) => {
      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id as string

      await request
        .delete(POSTS_LIKE_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(OK)
        .then(async () => {
          const { likes: updatedDtoLikes } = (await Post.findById(postId))?.toJSON() as PostDto

          expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length - 1)
          expect(updatedDtoLikes.map(({ userId }) => userId).includes(selectedLikeOwnerId)).toBeFalsy()
        })

      done()
    })

    it('must return OK (200) but not modify the selected post nor throw any error when the provided user has not liked the post', async (done) => {
      const token = `bearer ${noLikerUserValidToken}`
      const postId = selectedPost.id as string

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
      const postId = selectedPost.id as string
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
      const postId = selectedPost.id as string
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
      const token = `bearer ${ownerValidToken}`
      const postId = mockedNonValidPostId
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

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id as string
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

      const token = `bearer ${ownerValidToken}`
      const postId = selectedPost.id as string
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
