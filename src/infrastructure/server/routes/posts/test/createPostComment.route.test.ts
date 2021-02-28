import { saveUsersFixture } from './../../../../../test/fixtures/mongodb/users'
import supertest, { SuperTest, Test } from 'supertest'
import { lorem } from 'faker'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { BAD_REQUEST, OK, FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@errors'
import { ExtendedPostDomainModel, PostCommentOwnerDomainModel } from '@domainModels'
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

    const [selectedPostDto] = testingLikedAndCommentedPersistedDtoPosts
    const { _id: selectedPostId, owner: selectedPostOwnerDto } = selectedPostDto

    const [selectedPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts

    const {
      username: postOwnerUsername,
      password: postOwnerPassword,
      email: postOwnerEmail,
      name: postOwnerName,
      surname: postOwnerSurname,
      avatar: postOwnerAvatar,
      token: validToken
    } = testingUsers.find(({ id }) => id === selectedPostOwnerDto.userId)!
    const selectedPostOwnerDtoToBePersisted: TestingProfileDto = {
      _id: selectedPostOwnerDto.userId,
      username: postOwnerUsername,
      password: postOwnerPassword,
      email: postOwnerEmail,
      name: postOwnerName,
      surname: postOwnerSurname,
      avatar: postOwnerAvatar,
      token: validToken
    }

    const {
      id: freeUserId,
      username: freeUserUsername,
      password: freeUserPassword,
      email: freeUserEmail,
      avatar: freeUserAvatar,
      name: freeUserName,
      surname: freeUserSurname,
      token: freeUserToken
    } = testingUsers.find(({ id }) => id === testingDomainModelFreeUsers[0].id)!
    const freeUserDataToBePersisted: TestingProfileDto = {
      _id: freeUserId,
      username: freeUserUsername,
      password: freeUserPassword,
      email: freeUserEmail,
      avatar: freeUserAvatar,
      name: freeUserName,
      surname: freeUserSurname,
      token: freeUserToken
    }
    const nonValidPostId = testingNonValidPostId

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await cleanUsersCollectionFixture()
      await saveUsersFixture([selectedPostOwnerDtoToBePersisted, freeUserDataToBePersisted])
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

    it('returns OK (200) and the selected post commented successfully, when the user is the post owner', async (done) => {
      const token = `bearer ${validToken}`
      const postId = selectedPostId
      const commentBody = lorem.paragraph()

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(OK)
        .then(async ({ body }) => {
          const updatedPost: ExtendedPostDomainModel = body

          const expectedPostFields = ['id', 'body', 'owner', 'comments', 'userIsOwner', 'userHasLiked', 'likes', 'createdAt', 'updatedAt'].sort()
          expect(Object.keys(updatedPost).sort()).toEqual(expectedPostFields)

          expect(updatedPost.id).toBe(selectedPostDomainModel.id)
          expect(updatedPost.body).toBe(selectedPostDomainModel.body)

          const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
          expect(Object.keys(updatedPost.owner).sort()).toEqual(expectedPostOwnerFields)
          expect(updatedPost.owner).toStrictEqual(selectedPostDomainModel.owner)

          expect(updatedPost.userIsOwner).toBeTruthy()
          expect(updatedPost.userHasLiked).toBeFalsy()

          expect(updatedPost.comments).toHaveLength(selectedPostDomainModel.comments.length + 1)
          const expectedCommentFields = ['id', 'body', 'owner', 'userIsOwner', 'createdAt', 'updatedAt'].sort()
          updatedPost.comments.forEach(comment => {
            expect(Object.keys(comment).sort()).toEqual(expectedCommentFields)
          })
          const originalCommentsIds = selectedPostDomainModel.comments.map(({ id }) => id.toString())
          const newPersistedComment = updatedPost.comments.find(({ id }) => !originalCommentsIds.includes(id!))

          expect(newPersistedComment?.body).toBe(commentBody)
          expect(newPersistedComment?.owner).toStrictEqual(selectedPostDomainModel.owner)
          expect(newPersistedComment?.userIsOwner).toBeTruthy()

          expect(updatedPost.likes).toStrictEqual(selectedPostDomainModel.likes)

          expect(updatedPost.createdAt).toBe(selectedPostDomainModel.createdAt)
          expect(updatedPost.updatedAt).not.toBe(selectedPostDomainModel.updatedAt)
        })

      done()
    })

    it('returns OK (200) and the selected post commented successfully, when the user is not the post owner', async (done) => {
      const token = `bearer ${freeUserToken}`
      const postId = selectedPostId
      const commentBody = lorem.paragraph()

      const freeCommentOwnerDomainModel: PostCommentOwnerDomainModel = {
        id: freeUserId,
        avatar: freeUserAvatar,
        name: freeUserName,
        surname: freeUserSurname
      }

      await request
        .post(POSTS_COMMENT_PATH)
        .set('Authorization', token)
        .send({ postId, commentBody })
        .expect(OK)
        .then(async ({ body }) => {
          const updatedPost: ExtendedPostDomainModel = body

          const expectedPostFields = ['id', 'body', 'owner', 'comments', 'userIsOwner', 'userHasLiked', 'likes', 'createdAt', 'updatedAt'].sort()
          expect(Object.keys(updatedPost).sort()).toEqual(expectedPostFields)

          expect(updatedPost.id).toBe(selectedPostDomainModel.id)
          expect(updatedPost.body).toBe(selectedPostDomainModel.body)

          const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
          expect(Object.keys(updatedPost.owner).sort()).toEqual(expectedPostOwnerFields)
          expect(updatedPost.owner).toStrictEqual(selectedPostDomainModel.owner)

          expect(updatedPost.userIsOwner).toBeFalsy()
          expect(updatedPost.userHasLiked).toBeFalsy()

          expect(updatedPost.comments).toHaveLength(selectedPostDomainModel.comments.length + 1)
          const expectedCommentFields = ['id', 'body', 'owner', 'userIsOwner', 'createdAt', 'updatedAt'].sort()
          updatedPost.comments.forEach(comment => {
            expect(Object.keys(comment).sort()).toEqual(expectedCommentFields)
          })
          const originalCommentsIds = selectedPostDomainModel.comments.map(({ id }) => id.toString())
          const newPersistedComment = updatedPost.comments.find(({ id }) => !originalCommentsIds.includes(id!))

          expect(newPersistedComment?.body).toBe(commentBody)
          expect(newPersistedComment?.owner).toStrictEqual(freeCommentOwnerDomainModel)
          expect(newPersistedComment?.userIsOwner).toBeTruthy()

          expect(updatedPost.likes).toStrictEqual(selectedPostDomainModel.likes)

          expect(updatedPost.createdAt).toBe(selectedPostDomainModel.createdAt)
          expect(updatedPost.updatedAt).not.toBe(selectedPostDomainModel.updatedAt)
        })

      done()
    })

    it('returns BAD_REQUEST (400) error when we send a wrong formatted token because the JWT section is empty', async (done) => {
      const token = `bearer ${''}$`
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const { id: selectedPostDomainModelId } = selectedPostDomainModel
      const postId = selectedPostDomainModelId.concat('abcde')
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
      const { id: selectedPostDomainModelId } = selectedPostDomainModel
      const postId = selectedPostDomainModelId.substring(1)
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
      const { id: selectedPostDomainModelId } = selectedPostDomainModel
      const postId = selectedPostDomainModelId.substring(3).concat('$%#')
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
      const postId = selectedPostId
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
