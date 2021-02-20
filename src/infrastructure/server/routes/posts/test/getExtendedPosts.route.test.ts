import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } from '@errors'
import { PostCommentDomainModel, PostDomainModel } from '@domainModels'
import { PostCommentDto, PostLikeDto, PostOwnerDto } from '@infrastructure/dtos'
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
  testingExpiredJwtToken
} from '@testingFixtures'

const [selectedPostDto, secondaryPost] = testingLikedAndCommentedPersistedDtoPosts
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

const POSTS_EXTENDED_PATH = '/posts/ext'

describe('[API] - Posts endpoints', () => {
  describe(`[GET] ${POSTS_EXTENDED_PATH}`, () => {
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

    it('must return OK (200) and an empty array in the body when no posts have been found', async (done) => {
      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          expect(body).toStrictEqual([])
        })

      done()
    })

    it('must return OK (200) and retrieve the persisted posts and the owned one by the user, marked like that', async (done) => {
      await savePostsFixture([selectedPostDto, secondaryPost])

      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          const ownedPost = persistedPosts.find(post => post.owner.id === userId)
          const expectedOwnedPost = {
            ...selectedPostDomainModel,
            userIsOwner: true,
            userHasLiked: false,
            comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(ownedPost).toStrictEqual(expectedOwnedPost)

          const notOwnedPost = persistedPosts.find(post => post.owner.id !== userId)
          const expectedNotOwnedPost = {
            ...secondaryPostDomainModel,
            userIsOwner: false,
            userHasLiked: false,
            comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(notOwnedPost).toStrictEqual(expectedNotOwnedPost)
        })

      done()
    })

    it('must return OK (200) and retrieve the persisted posts and the owned one by the user, marked as liked by itself', async (done) => {
      const postLikedByItsOwner = { ...selectedPostDto, likes: [...selectedPostDto.likes, postOwnerLikeDto] }

      await savePostsFixture([postLikedByItsOwner, secondaryPost])

      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          const ownedPost = persistedPosts.find(post => post.owner.id === userId)
          const expectedOwnedPost = {
            ...selectedPostDomainModel,
            userIsOwner: true,
            userHasLiked: true,
            comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
            likes: [...selectedPostDomainModel.likes, { id: userId, name, surname, avatar }]
          }
          expect(ownedPost).toStrictEqual(expectedOwnedPost)

          const notOwnedPost = persistedPosts.find(post => post.owner.id !== userId)
          const expectedNotOwnedPost = {
            ...secondaryPostDomainModel,
            userIsOwner: false,
            userHasLiked: false,
            comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(notOwnedPost).toStrictEqual(expectedNotOwnedPost)
        })

      done()
    })

    it('must return OK (200) and retrieve the persisted posts and the owned one by the user, commented by itself', async (done) => {
      const postCommentedByItsOwner = { ...selectedPostDto, comments: [...selectedPostDto.comments, postOwnerCommentDto] }

      await savePostsFixture([postCommentedByItsOwner, secondaryPost])

      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          const ownedPost = persistedPosts.find(post => post.owner.id === userId)
          const expectedOwnedPost = {
            ...selectedPostDomainModel,
            userIsOwner: true,
            userHasLiked: false,
            comments: [...selectedPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
          }
          expect(ownedPost).toStrictEqual(expectedOwnedPost)

          const notOwnedPost = persistedPosts.find(post => post.owner.id !== userId)
          const expectedNotOwnedPost = {
            ...secondaryPostDomainModel,
            userIsOwner: false,
            userHasLiked: false,
            comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(notOwnedPost).toStrictEqual(expectedNotOwnedPost)
        })

      done()
    })

    it('must return OK (200) and retrieve the persisted posts and the another user one, liked by the selected user', async (done) => {
      const anotherUserPostLiked = { ...secondaryPost, likes: [...secondaryPost.likes, postOwnerLikeDto] }

      await savePostsFixture([selectedPostDto, anotherUserPostLiked])

      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          const ownedPost = persistedPosts.find(post => post.owner.id === userId)
          const expectedOwnedPost = {
            ...selectedPostDomainModel,
            userIsOwner: true,
            userHasLiked: false,
            comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(ownedPost).toStrictEqual(expectedOwnedPost)

          const notOwnedPost = persistedPosts.find(post => post.owner.id !== userId)
          const expectedNotOwnedPost = {
            ...secondaryPostDomainModel,
            userIsOwner: false,
            userHasLiked: true,
            comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
            likes: [...secondaryPostDomainModel.likes, { id: userId, name, surname, avatar }]
          }
          expect(notOwnedPost).toStrictEqual(expectedNotOwnedPost)
        })

      done()
    })

    it('must return OK (200) and retrieve the persisted posts and the another user one, commented by the selected user', async (done) => {
      const anotherUserPostCommented = { ...secondaryPost, comments: [...secondaryPost.comments, postOwnerCommentDto] }

      await savePostsFixture([selectedPostDto, anotherUserPostCommented])

      const token = `bearer ${postOwnerToken}`

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(OK)
        .then(({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          const ownedPost = persistedPosts.find(post => post.owner.id === userId)
          const expectedOwnedPost = {
            ...selectedPostDomainModel,
            userIsOwner: true,
            userHasLiked: false,
            comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
          }
          expect(ownedPost).toStrictEqual(expectedOwnedPost)

          const notOwnedPost = persistedPosts.find(post => post.owner.id !== userId)
          const expectedNotOwnedPost = {
            ...secondaryPostDomainModel,
            userIsOwner: false,
            userHasLiked: false,
            comments: [...secondaryPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
          }
          expect(notOwnedPost).toStrictEqual(expectedNotOwnedPost)
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a token of non recorded user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a wrong formatted token because it includes non allowed characters', async (done) => {
      const token = `bearer ${postOwnerToken}$`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return BAD_REQUEST (400) error when we send a wrong formatted token because it is incomplete', async (done) => {
      const token = `bearer ${postOwnerToken.split('.').shift()}`
      const expectedErrorMessage = 'Wrong token format'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return an BAD_REQUEST (400) error when we send a token that belongs to a non registered user', async (done) => {
      const token = `bearer ${testingValidJwtTokenForNonPersistedUser}`
      const expectedErrorMessage = 'User does not exist'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(BAD_REQUEST)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return UNAUTHORIZED (401) error when we send an expired token', async (done) => {
      const token = `bearer ${testingExpiredJwtToken}`
      const expectedErrorMessage = 'Token expired'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(UNAUTHORIZED)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return FORBIDDEN (403) when the sent token is empty', async (done) => {
      const token = `bearer ${''}`
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return FORBIDDEN (403) error when we do not provide the authorization header', async (done) => {
      const expectedErrorMessage = 'Required token was not provided'

      await request
        .get(POSTS_EXTENDED_PATH)
        .expect(FORBIDDEN)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the posts retrieving process throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => {
        throw new Error()
      })

      const token = `bearer ${postOwnerToken}`
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .get(POSTS_EXTENDED_PATH)
        .set('Authorization', token)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPosts').mockRestore()

      done()
    })
  })
})
