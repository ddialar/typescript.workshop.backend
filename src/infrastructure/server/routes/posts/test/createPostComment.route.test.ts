import supertest, { SuperTest, Test } from 'supertest'
import { lorem } from 'faker'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { PostDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'
import { UserDto, UserProfileDto } from '@infrastructure/dtos'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  testingUsers,
  testingValidJwtTokenForNonPersistedUser,
  testingExpiredJwtToken,
  cleanUsersCollectionFixture,
  saveUserFixture,
  cleanPostsCollectionFixture,
  savePostsFixture,
  testingNonValidPostId
} from '@testingFixtures'

const POSTS_COMMENT_PATH = '/posts/comment'

describe('[API] - Posts endpoints', () => {
  describe(`[POST] ${POSTS_COMMENT_PATH}`, () => {
    interface TestingProfileDto extends UserProfileDto {
      _id: string
      password: string
      token: string
    }

    const { connect, disconnect } = mongodb

    const mockedPosts = testingLikedAndCommentedPersistedDomainModelPosts
    const [originalPost] = mockedPosts
    const nonValidPostId = testingNonValidPostId
    const [testingFreeUser] = testingDomainModelFreeUsers
    const { id, username, password, email, avatar, name, surname, token: validToken } = testingUsers.find(({ id }) => id === testingFreeUser.id)!

    const mockedUserDataToBePersisted: TestingProfileDto = {
      _id: id,
      username,
      password,
      email,
      avatar,
      name,
      surname,
      token: validToken
    }
    let persistedUser: UserDto

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      persistedUser = await saveUserFixture(mockedUserDataToBePersisted)
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

    it('returns OK (200) and the updated post with the new comment', async (done) => {
      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(OK)
        .then(async ({ body }) => {
          const updatedPost: PostDomainModel = body

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
          const originalCommentsIds = originalPost.comments.map(({ id }) => id.toString())
          const updatedCommentsIds = updatedPost.comments.map(({ id }) => id?.toString())
          const newPostId = updatedCommentsIds.find((updatedId) => !originalCommentsIds.includes(updatedId!))
          const newPersistedComment = updatedPost.comments.find((comment) => comment.id === newPostId)!
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

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async (done) => {
      const token = `bearer ${''}$`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async (done) => {
      const token = `bearer ${validToken}$`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because it is not complete', async (done) => {
      const token = `bearer ${validToken.split('.').shift()}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Wrong token format'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'User does not exist'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when postId is not provided', async (done) => {
      const token = `bearer ${validToken}`
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when postId is empty', async (done) => {
      const token = `bearer ${validToken}`
      const postId = ''
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when postId has more characters than allowed ones', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.concat('abcde')
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when postId has less characters than required ones', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.substring(1)
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when postId has non allowed characters', async (done) => {
      const token = `bearer ${validToken}`
      const { id: originalPostId } = originalPost
      const postId = originalPostId.substring(3).concat('$%#')
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when commentBody is not provided', async (done) => {
      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when commentBody is empty', async (done) => {
      const token = `bearer ${validToken}`
      const postId = ''
      const expectedErrorMessage = 'New post comment data error.'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId })
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Token expired'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns FORBIDDEN (403) when we send an empty token', async (done) => {
      const token = ''
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .post(POSTS_COMMENT_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns NOT_FOUND (404) when the provided post ID does nott exist', async (done) => {
      const token = `bearer ${validToken}`
      const postId = nonValidPostId
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Post not found'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
      jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => Promise.resolve(null))

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPostComment').mockRestore()

      done()
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${validToken}`
      const { id: postId } = originalPost
      const commentBody = lorem.paragraph()
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'createPostComment').mockRestore()

      done()
    })
  })
})
