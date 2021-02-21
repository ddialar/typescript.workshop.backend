import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from '@errors'
import { ExtendedPostDomainModel, PostCommentDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  savePostsFixture,
  cleanPostsCollectionFixture,
  testingUsers,
  generateMockedMongoDbId,
  saveUsersFixture,
  cleanUsersCollectionFixture,
  testingValidJwtTokenForNonPersistedUser,
  testingNonValidPostId,
  testingExpiredJwtToken
} from '@testingFixtures'
import { PostCommentDto, PostLikeDto, PostOwnerDto } from '@infrastructure/dtos'

const [selectedPostDto, secondaryPostDto] = testingLikedAndCommentedPersistedDtoPosts
const [selectedPostDomainModel, secondaryPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts

const { id: userId, username, password, email, name, surname, avatar, createdAt, updatedAt, token: postOwnerToken } = testingUsers.find(({ id }) => id === selectedPostDto.owner.userId)!
const mockedPostOwner = {
  _id: userId,
  username,
  password,
  email,
  token: postOwnerToken
}
const postOwnerDtoObject: PostOwnerDto = {
  userId,
  name,
  surname,
  avatar,
  createdAt,
  updatedAt
}
const postOwnerCommentDto: PostCommentDto = {
  _id: generateMockedMongoDbId(),
  body: 'Testing post owner comment',
  owner: postOwnerDtoObject,
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
}
const postOwnerCommentDomainModel: PostCommentDomainModel = {
  id: postOwnerCommentDto._id,
  body: 'Testing post owner comment',
  owner: {
    id: userId,
    name,
    surname,
    avatar
  },
  createdAt: (new Date()).toISOString(),
  updatedAt: (new Date()).toISOString()
}
const postOwnerLikeDto: PostLikeDto = postOwnerDtoObject
const nonValidPostId = testingNonValidPostId
const unknownUserToken = testingValidJwtTokenForNonPersistedUser
const expiredToken = testingExpiredJwtToken

const POSTS_EXTENDED_PATH = '/posts/ext'

describe('[API] - Posts endpoints', () => {
  describe(`[GET] ${POSTS_EXTENDED_PATH}/:id`, () => {
    const { connect, disconnect } = mongodb

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await saveUsersFixture([mockedPostOwner])
    })

    beforeEach(async () => {
      await cleanPostsCollectionFixture()
    })

    afterAll(async () => {
      await cleanUsersCollectionFixture()
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('must return OK (200) and the indicated post, not owned nor liked by the provided user because it is not bound with the post', async (done) => {
      await savePostsFixture([secondaryPostDto])

      const token = `bearer ${postOwnerToken}`
      const postId = secondaryPostDto._id
      const expectedOwnedPost = {
        ...secondaryPostDomainModel,
        userIsOwner: false,
        userHasLiked: false,
        comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return OK (200) and the indicated post, marked as owned by the provided user', async (done) => {
      await savePostsFixture([selectedPostDto])

      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id
      const expectedOwnedPost = {
        ...selectedPostDomainModel,
        userIsOwner: true,
        userHasLiked: false,
        comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return OK (200) and the indicated post, marked as owned and liked by the provided user', async (done) => {
      const postLikedByItsOwner = { ...selectedPostDto, likes: [...selectedPostDto.likes, postOwnerLikeDto] }

      await savePostsFixture([postLikedByItsOwner])

      const token = `bearer ${postOwnerToken}`
      const postId = postLikedByItsOwner._id
      const expectedOwnedPost = {
        ...selectedPostDomainModel,
        userIsOwner: true,
        userHasLiked: true,
        comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
        likes: [...selectedPostDomainModel.likes, { id: userId, name, surname, avatar }]
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return OK (200) and the indicated post, marked as owned by the provided user and with a comment created by itself', async (done) => {
      const postCommentedByItsOwner = { ...selectedPostDto, comments: [...selectedPostDto.comments, postOwnerCommentDto] }

      await savePostsFixture([postCommentedByItsOwner])

      const token = `bearer ${postOwnerToken}`
      const postId = postCommentedByItsOwner._id
      const expectedOwnedPost = {
        ...selectedPostDomainModel,
        userIsOwner: true,
        userHasLiked: false,
        comments: [...selectedPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return OK (200) and the indicated post, where the provided user is not its owner but who has liked it', async (done) => {
      const anotherUserPostLiked = { ...secondaryPostDto, likes: [...secondaryPostDto.likes, postOwnerLikeDto] }

      await savePostsFixture([anotherUserPostLiked])

      const token = `bearer ${postOwnerToken}`
      const postId = anotherUserPostLiked._id
      const expectedOwnedPost = {
        ...secondaryPostDomainModel,
        userIsOwner: false,
        userHasLiked: true,
        comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
        likes: [...secondaryPostDomainModel.likes, { id: userId, name, surname, avatar }]
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return OK (200) and the indicated post, where the provided user is not its owner but who has commented it', async (done) => {
      const anotherUserPostCommented = { ...secondaryPostDto, comments: [...secondaryPostDto.comments, postOwnerCommentDto] }

      await savePostsFixture([anotherUserPostCommented])

      const token = `bearer ${postOwnerToken}`
      const postId = anotherUserPostCommented._id
      const expectedOwnedPost = {
        ...secondaryPostDomainModel,
        userIsOwner: false,
        userHasLiked: false,
        comments: [...secondaryPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
      }

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<ExtendedPostDomainModel>(expectedOwnedPost)
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a token of non recorded user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'User does not exist'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has more characters than allowed ones', async (done) => {
      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id.concat('abcde')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has less characters than required ones', async (done) => {
      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id.substring(1)
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has characters non allowed by the ID regex definition', async (done) => {
      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id.substring(2).concat('-_')
      const expectedErrorMessage = 'Post identification not valid'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when postId has characters non allowed by Express', async (done) => {
      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id.substring(2).concat('$%')
      const expectedErrorMessage = `Failed to decode param '${postId}'`

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) when the action is performed by an user who is not recorded in the database', async (done) => {
      const token = `bearer ${unknownUserToken}`
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'User does not exist'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) when the action is performed by an user with an expired token', async (done) => {
      const token = `bearer ${expiredToken}`
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'Token expired'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return FORBIDDEN (403) when the sent token is empty', async (done) => {
      const token = ''
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return a FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return NOT_FOUND (404) when the selected post does not exist', async (done) => {
      const token = `bearer ${postOwnerToken}`
      const postId = nonValidPostId
      const expectedErrorMessage = 'Post not found'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the retrieving process throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const token = `bearer ${postOwnerToken}`
      const postId = selectedPostDto._id
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .get(`${POSTS_EXTENDED_PATH}/${postId}`)
        .set('Authorization', token)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostById').mockRestore()

      done()
    })
  })
})
