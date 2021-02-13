import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  cleanPostsCollectionFixture,
  savePostsFixture,
  getPostByIdFixture,
  testingNonValidPostId,
  testingNonValidLikeOwnerId
} from '@testingFixtures'

import { dislikePost } from '@domainServices'
import { DeletingPostLikeError, GettingPostError, GettingPostLikeError, PostNotFoundError } from '@errors'

describe('[SERVICES] Post - dislikePost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts
  const [mockedCompleteDtoPost, mockedEmptyLikesDtoPost] = mockedDtoPosts
  mockedEmptyLikesDtoPost.likes = []

  const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts
  const [selectedPost] = resultPosts
  const [selectedLike] = selectedPost.likes
  const { id: selectedLikeOwnerId } = selectedLike
  const mockedNonValidPostId = testingNonValidPostId
  const mockedNonValidLikeOwnerId = testingNonValidLikeOwnerId

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
    await savePostsFixture([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must delete the selected post like', async (done) => {
    const postId = selectedPost.id
    const likeOwnerId = selectedLikeOwnerId

    await dislikePost(postId, likeOwnerId)

    const { likes: updatedDtoLikes } = (await getPostByIdFixture(postId))!

    expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length - 1)
    expect(updatedDtoLikes.map(({ userId }) => userId).includes(likeOwnerId)).toBeFalsy()

    done()
  })

  it('must not modify the selected post nor throw any error when the provided user has not liked the post', async (done) => {
    const postId = selectedPost.id
    const likeOwnerId = mockedNonValidLikeOwnerId

    await dislikePost(postId, likeOwnerId)

    const { likes: updatedDtoLikes } = (await getPostByIdFixture(postId))!

    expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length)

    done()
  })

  it('must throw NOT_FOUND (404) when the provided post ID doesn\'t exist', async (done) => {
    const postId = mockedNonValidPostId
    const likeOwnerId = selectedLikeOwnerId

    await expect(dislikePost(postId, likeOwnerId)).rejects.toThrowError(new PostNotFoundError(`Post '${postId}' not found`))

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource retrieving post by ID process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    try {
      await dislikePost(postId, likeOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource retrieving post like by owner ID throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new GettingPostLikeError(`Error retereaving post comment. ${errorMessage}`)

    try {
      await dislikePost(postId, likeOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource disliking process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'dislikePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new DeletingPostLikeError(`Error deleting like '${selectedLike.id}', from post '${postId}', by user '${likeOwnerId}'. ${errorMessage}`)

    try {
      await dislikePost(postId, likeOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'dislikePost').mockRestore()

    done()
  })
})
