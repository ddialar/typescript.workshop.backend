import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  cleanPostsCollectionFixture,
  savePostsFixture,
  testingNonValidPostId,
  testingNonValidLikeOwnerId
} from '@testingFixtures'

import { dislikePost } from '@domainServices'
import { DeletingPostLikeError, GettingPostError, PostDislikeUserError, PostNotFoundError } from '@errors'

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

  it('dislikes the selected post, deleting this like from the post', async () => {
    const postId = selectedPost.id
    const likeOwnerId = selectedLikeOwnerId

    const { userHasLiked, likes: updatedDtoLikes } = await dislikePost(postId, likeOwnerId)

    expect(userHasLiked).toBeFalsy()
    expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length - 1)
    expect(updatedDtoLikes.map(({ id }) => id).includes(likeOwnerId)).toBeFalsy()
  })

  it('throws BAD_REQUEST (400) when the provided user has not liked the post', async () => {
    const postId = selectedPost.id
    const likeOwnerId = mockedNonValidLikeOwnerId

    const expectedError = new PostDislikeUserError(`User '${likeOwnerId}' tried to dislike the post '${postId}' that was not previously liked by it.`)

    try {
      await dislikePost(postId, likeOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }
  })

  it('throws NOT_FOUND (404) when the provided post ID does not exist', async () => {
    const postId = mockedNonValidPostId
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    try {
      await dislikePost(postId, likeOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the datasource retrieving post by ID process throws an unexpected error', async () => {
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
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the datasource disliking process throws an unexpected error', async () => {
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
  })
})
