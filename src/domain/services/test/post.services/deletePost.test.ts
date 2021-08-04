import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  cleanPostsCollectionFixture,
  savePostsFixture,
  getPostByIdFixture,
  testingNonValidPostId
} from '@testingFixtures'

import { deletePost } from '@domainServices'
import { DeletingPostError, GettingPostError, PostNotFoundError, UnauthorizedPostDeletingError } from '@errors'

describe('[SERVICES] Post - deletePost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
  const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts
  const { id: selectedPostOwnerId } = selectedPost.owner
  const mockedNonValidPostId = testingNonValidPostId
  const [{ id: unauthorizedUserId }] = testingDomainModelFreeUsers

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must delete the selected post', async () => {
    const postId = selectedPost.id
    const postOwnerId = selectedPostOwnerId

    await deletePost(postId, postOwnerId)

    const retrievedPost = await getPostByIdFixture(postId)

    expect(retrievedPost).toBeNull()
  })

  it('must throw NOT_FOUND (404) when we select a post which does not exist', async () => {
    const postId = mockedNonValidPostId
    const postOwnerId = selectedPostOwnerId
    const expectedError = new PostNotFoundError(`Post with id '${postId}' was not found to be deleted by user with id '${postOwnerId}'.`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)
  })

  it('must throw UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the post', async () => {
    const postId = selectedPost.id
    const postOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostDeletingError(`User '${postOwnerId}' is not the owner of the post '${postId}', which is trying to delete.`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error retrieving the post', async () => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const postOwnerId = selectedPostOwnerId
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    try {
      await deletePost(postId, postOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostById').mockRestore()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async () => {
    jest.spyOn(postDataSource, 'deletePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const postOwnerId = selectedPostOwnerId
    const expectedError = new DeletingPostError(`Error deleting post '${postId}' by user '${postOwnerId}'. ${errorMessage}`)

    try {
      await deletePost(postId, postOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'deletePost').mockRestore()
  })
})
