import supertest, { SuperTest, Test } from 'supertest'
import { lorem } from 'faker'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '@errors'
import { PostCommentOwnerDomainModel, PostDomainModel, UserDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { UserDto, UserProfileDto } from '@infrastructure/dtos'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollection,
  saveUser,
  cleanPostsCollection,
  savePosts
} from '@testingFixtures'

const POSTS_COMMENT_PATH = '/posts/comment'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_COMMENT_PATH}`, () => {
    interface TestingProfileDto extends UserProfileDto {
      _id: string
      password: string
    }

    const { connect, disconnect } = mongodb

    const mockedPosts = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
    const originalPost = mockedPosts[0]
    const testingFreeUser = testingDomainModelFreeUsers[0] as PostCommentOwnerDomainModel
    const { id, username, password, email, avatar, name, surname, token: validToken } = testingUsers.find(({ id }) => id === testingFreeUser.id) as UserDomainModel

    const mockedUserDataToBePersisted: TestingProfileDto = {
      _id: id,
      username,
      password,
      email,
      avatar,
      name,
      surname
    }
    let persistedUser: UserDto

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollection()
      persistedUser = await saveUser(mockedUserDataToBePersisted)
    })

    beforeEach(async () => {
      await cleanPostsCollection()
      await savePosts(testingLikedAndCommentedPersistedDtoPosts)
    })

    afterAll(async () => {
      await cleanUsersCollection()
      await cleanPostsCollection()
      await disconnect()
    })

    it('must return OK (200) and the updated post with the new comment', async (done) => {
      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(OK)
        .then(async ({ body }) => {
          const updatedPost = body as PostDomainModel

          const expectedPostFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
          const updatedPostFields = Object.keys(updatedPost).sort()
          expect(updatedPostFields.sort()).toEqual(expectedPostFields.sort())

          expect(updatedPost.id).toBe(originalPost.id)
          expect(updatedPost.body).toBe(originalPost.body)

          const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar']
          const createPostCommentdOwnerPostFields = Object.keys(updatedPost.owner).sort()
          expect(createPostCommentdOwnerPostFields.sort()).toEqual(expectedPostOwnerFields.sort())
          expect(updatedPost.owner).toStrictEqual(originalPost.owner)

          expect(updatedPost.comments).toHaveLength(originalPost.comments.length + 1)
          const originalCommentsIds = originalPost.comments.map(({ id }) => id as string)
          const updatedCommentsIds = updatedPost.comments.map(({ id }) => id as string)
          const newPostId = updatedCommentsIds.find((updatedId) => !originalCommentsIds.includes(updatedId))
          const newPersistedComment = updatedPost.comments.find((comment) => comment.id === newPostId) as PostDomainModel
          expect(newPersistedComment.body).toBe(commentBody)
          expect(newPersistedComment.owner.id).toBe(persistedUser._id.toString())
          expect(newPersistedComment.owner.name).toBe(persistedUser.name)
          expect(newPersistedComment.owner.surname).toBe(persistedUser.surname)
          expect(newPersistedComment.owner.avatar).toBe(persistedUser.avatar)

          expect(updatedPost.likes).toStrictEqual(originalPost.likes)

          expect(updatedPost.createdAt).toBe(originalPost.createdAt)
          expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)
        })

      done()
    })

    it('must return FORBIDDEN (403) when we send an empty token', async (done) => {
      const token = ''
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const errorMessage = 'Required token was not provided'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const errorMessage = 'Token expired'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const errorMessage = 'User does not exist'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
      jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => Promise.resolve(null))

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const errorMessage = 'Internal Server Error'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      jest.spyOn(postDataSource, 'createPostComment').mockRestore()

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const errorMessage = 'Internal Server Error'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
        })

      jest.spyOn(postDataSource, 'createPostComment').mockRestore()

      done()
    })
  })
})
