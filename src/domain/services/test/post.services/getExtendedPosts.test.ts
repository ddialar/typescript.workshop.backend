import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingUsers,
  savePostsFixture,
  cleanPostsCollectionFixture,
  generateMockedMongoDbId
} from '@testingFixtures'

import { getExtendedPosts } from '@domainServices'
import { GettingPostError } from '@errors'
import { PostCommentDto, PostLikeDto, PostOwnerDto } from '@infrastructure/dtos'
import { PostCommentDomainModel } from '@domainModels'

const [selectedPostDto, secondaryPost] = testingLikedAndCommentedPersistedDtoPosts
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
  createdAt: (new Date()).toISOString().replace(/\dZ/, '0Z'),
  updatedAt: (new Date()).toISOString().replace(/\dZ/, '0Z')
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
  createdAt: (new Date()).toISOString().replace(/\dZ/, '0Z'),
  updatedAt: (new Date()).toISOString().replace(/\dZ/, '0Z')
}
const postOwnerLikeDto: PostLikeDto = postOwnerDtoObject

describe('[SERVICES] Post - getExtendedPosts', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'

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

  it('must retrieve an empty array when there are no recorded posts', async () => {
    await expect(getExtendedPosts(userId)).resolves.toHaveLength(0)
  })

  it('must retrieve the persisted posts and the owned one by the user, marked like that', async () => {
    await savePostsFixture([selectedPostDto, secondaryPost])

    const persistedPosts = await getExtendedPosts(userId)

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

  it('must retrieve the persisted posts and the owned one by the user, marked as liked by itself', async () => {
    const postLikedByItsOwner = { ...selectedPostDto, likes: [...selectedPostDto.likes, postOwnerLikeDto] }

    await savePostsFixture([postLikedByItsOwner, secondaryPost])

    const persistedPosts = await getExtendedPosts(userId)

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

  it('must retrieve the persisted posts and the owned one by the user, commented by itself', async () => {
    const postCommentedByItsOwner = { ...selectedPostDto, comments: [...selectedPostDto.comments, postOwnerCommentDto] }

    await savePostsFixture([postCommentedByItsOwner, secondaryPost])

    const persistedPosts = await getExtendedPosts(userId)

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

  it('must retrieve the persisted posts and the another user one, liked by the selected user', async () => {
    const anotherUserPostLiked = { ...secondaryPost, likes: [...secondaryPost.likes, postOwnerLikeDto] }

    await savePostsFixture([selectedPostDto, anotherUserPostLiked])

    const persistedPosts = await getExtendedPosts(userId)

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

  it('must retrieve the persisted posts and the another user one, commented by the selected user', async () => {
    const anotherUserPostCommented = { ...secondaryPost, comments: [...secondaryPost.comments, postOwnerCommentDto] }

    await savePostsFixture([selectedPostDto, anotherUserPostCommented])

    const persistedPosts = await getExtendedPosts(userId)

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

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const expectedError = new GettingPostError(`Error retereaving posts. ${errorMessage}`)

    try {
      await getExtendedPosts(userId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPosts').mockRestore()
  })
})
