import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  savePostsFixture,
  cleanPostsCollectionFixture,
  testingUsers,
  testingNonValidPostOwnerId,
  generateMockedMongoDbId,
  testingNonValidUserId
} from '@testingFixtures'

import { getExtendedPostById } from '@domainServices'
import { GettingPostError, PostNotFoundError } from '@errors'
import { PostCommentDto, PostLikeDto, PostOwnerDto } from '@infrastructure/dtos'
import { PostCommentDomainModel } from '@domainModels'

const [selectedPostDto, secondaryPostDto] = testingLikedAndCommentedPersistedDtoPosts
const [selectedPostDomainModel, secondaryPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts

const { id: userId, name, surname, avatar, createdAt, updatedAt } = testingUsers.find(({ id }) => id === selectedPostDto.owner.userId)!
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

describe('[SERVICES] Post - getExtendedPostById', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the indicated post, not owned nor liked by the provided user because it is not bound with the post', async (done) => {
    await savePostsFixture([secondaryPostDto])

    const postId = secondaryPostDto._id
    const userId = testingNonValidUserId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedOwnedPost = {
      ...secondaryPostDomainModel,
      userIsOwner: false,
      userHasLiked: false,
      comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
    }
    expect(retrievedPost).toStrictEqual(expectedOwnedPost)

    done()
  })

  it('must retrieve the indicated post, marked as owned by the provided user', async (done) => {
    await savePostsFixture([selectedPostDto])

    const postId = selectedPostDto._id
    const userId = selectedPostDto.owner.userId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedOwnedPost = {
      ...selectedPostDomainModel,
      userIsOwner: true,
      userHasLiked: false,
      comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false }))
    }
    expect(retrievedPost).toStrictEqual(expectedOwnedPost)

    done()
  })

  it('must retrieve the indicated post, marked as owned and liked by the provided user', async (done) => {
    const postLikedByItsOwner = { ...selectedPostDto, likes: [...selectedPostDto.likes, postOwnerLikeDto] }

    await savePostsFixture([postLikedByItsOwner])

    const postId = selectedPostDto._id
    const userId = selectedPostDto.owner.userId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedOwnedPost = {
      ...selectedPostDomainModel,
      userIsOwner: true,
      userHasLiked: true,
      comments: selectedPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
      likes: [...selectedPostDomainModel.likes, { id: userId, name, surname, avatar }]
    }
    expect(retrievedPost).toStrictEqual(expectedOwnedPost)

    done()
  })

  it('must retrieve the indicated post, marked as owned by the provided user and with a comment created by itself', async (done) => {
    const postCommentedByItsOwner = { ...selectedPostDto, comments: [...selectedPostDto.comments, postOwnerCommentDto] }

    await savePostsFixture([postCommentedByItsOwner])

    const postId = selectedPostDto._id
    const userId = selectedPostDto.owner.userId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedOwnedPost = {
      ...selectedPostDomainModel,
      userIsOwner: true,
      userHasLiked: false,
      comments: [...selectedPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
    }
    expect(retrievedPost).toStrictEqual(expectedOwnedPost)

    done()
  })

  it('must retrieve the indicated post, where the provided user is not its owner but who has liked it', async (done) => {
    const anotherUserPostLiked = { ...secondaryPostDto, likes: [...secondaryPostDto.likes, postOwnerLikeDto] }

    await savePostsFixture([anotherUserPostLiked])

    const postId = secondaryPostDto._id
    const userId = selectedPostDto.owner.userId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedNotOwnedPost = {
      ...secondaryPostDomainModel,
      userIsOwner: false,
      userHasLiked: true,
      comments: secondaryPostDomainModel.comments.map(comment => ({ ...comment, userIsOwner: false })),
      likes: [...secondaryPostDomainModel.likes, { id: userId, name, surname, avatar }]
    }
    expect(retrievedPost).toStrictEqual(expectedNotOwnedPost)

    done()
  })

  it('must retrieve the indicated post, where the provided user is not its owner but who has commented it', async (done) => {
    const anotherUserPostCommented = { ...secondaryPostDto, comments: [...secondaryPostDto.comments, postOwnerCommentDto] }

    await savePostsFixture([anotherUserPostCommented])

    const postId = secondaryPostDto._id
    const userId = selectedPostDto.owner.userId

    const retrievedPost = await getExtendedPostById(postId, userId)

    const expectedNotOwnedPost = {
      ...secondaryPostDomainModel,
      userIsOwner: false,
      userHasLiked: false,
      comments: [...secondaryPostDomainModel.comments, postOwnerCommentDomainModel].map(comment => ({ ...comment, userIsOwner: comment.owner.id === userId }))
    }
    expect(retrievedPost).toStrictEqual(expectedNotOwnedPost)

    done()
  })

  it('must throw an NOT_FOUND (404) when the selected post does not exist', async (done) => {
    const postId = testingNonValidPostOwnerId
    const userId = selectedPostDto.owner.userId

    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(getExtendedPostById(postId, userId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPostDto._id
    const userId = selectedPostDto.owner.userId
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    try {
      await getExtendedPostById(postId, userId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })
})
