import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  cleanPostsCollectionFixture,
  savePostsFixture,
  testingNonValidPostId
} from '@testingFixtures'

import { deletePostComment } from '@domainServices'
import { DeletingPostCommentError, GettingPostCommentError, PostCommentNotFoundError, PostNotFoundError, UnauthorizedPostCommentDeletingError } from '@errors'

describe('[SERVICES] Post - deletePostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
  const { 1: mockedNonValidPost } = mockedPosts
  const { _id: mockedNonValidPostId } = mockedNonValidPost
  const [{ _id: mockedNonValidCommentId }] = mockedNonValidPost.comments

  const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts
  const [selectedComment] = selectedPost.comments

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

  it('deletes the selected post comment successfully', async (done) => {
    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id

    const { comments: updatedDtoComments } = await deletePostComment(postId, commentId, commentOwnerId)

    expect(updatedDtoComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedDtoComments.map(({ id }) => id).includes(commentId)).toBeFalsy()

    done()
  })

  it('throws UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async (done) => {
    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('throws NOT_FOUND (404) when the provided post does not exist', async (done) => {
    const postId = testingNonValidPostId
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('throws NOT_FOUND (404) when we select a post which does not contain the provided comment', async (done) => {
    const postId = mockedNonValidPostId
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('throws NOT_FOUND (404) when provide a comment which is not contained into the selected post', async (done) => {
    const postId = selectedPost.id
    const commentId = mockedNonValidCommentId
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the retrieving post comment datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`)

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostComment').mockRestore()

    done()
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the deleting process datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${errorMessage}`)

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })
})
