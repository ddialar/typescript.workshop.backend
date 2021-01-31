import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { PostCommentOwnerDomainModel, PostDomainModel, PostLikeDomainModel, UserDomainModel } from '@domainModels'
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
  getPostByIdFixture
} from '@testingFixtures'
import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'

const POSTS_LIKE_PATH = '/posts/like'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_LIKE_PATH}`, () => {
    interface TestingProfileDto extends UserProfileDto {
      _id: string
      password: string
    }

    const { connect, disconnect } = mongodb

    const mockedPosts = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
    const originalPost = mockedPosts[0]
    const nonValidPostId = originalPost.comments[0].id as string
    const testingFreeUser = testingDomainModelFreeUsers[0] as PostCommentOwnerDomainModel
    const { id, username, password, email, avatar, name, surname, token: validToken } = testingUsers.find(({ id }) => id === testingFreeUser.id) as UserDomainModel

    const mockedUserDataToBePersisted: TestingProfileDto = {
      _id: id,
      username,
      password,
      email,
      name,
      surname,
      avatar
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
          const updatedPost = mapPostFromDtoToDomainModel(await getPostByIdFixture(postId as string)) as PostDomainModel

          expect(updatedPost.id).not.toBeNull()
          expect(updatedPost.body).toBe(originalPost.body)
          expect(updatedPost.owner).toStrictEqual(originalPost.owner)
          expect(updatedPost.comments).toStrictEqual(originalPost.comments)

          expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
          const originalLikesIds = originalPost.likes.map(({ id }) => id as string)
          const updatedLikesIds = updatedPost.likes.map(({ id }) => id as string)
          const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
          const newPersistedLike = updatedPost.likes.find((like) => like.id === newLikeId) as PostLikeDomainModel
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
