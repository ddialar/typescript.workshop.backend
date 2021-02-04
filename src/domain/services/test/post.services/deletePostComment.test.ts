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

import { deletePostComment } from '@domainServices'
import { DeletingPostCommentError, GettingPostCommentError, PostCommentNotFoundError, PostNotFoundError, UnauthorizedPostCommentDeletingError } from '@errors'
import { PostDto } from '@infrastructure/dtos'

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

  it('must delete the selected post comment', async (done) => {
    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id

    await deletePostComment(postId, commentId, commentOwnerId)

    const { comments: updatedDtoComments } = (await getPostByIdFixture(postId))!

    expect(updatedDtoComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedDtoComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()

    done()
  })

  it('must throw NOT_FOUND (404) when the provided post does not exist', async (done) => {
    const postId = testingNonValidPostId
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw NOT_FOUND (404) when we select a post which does not contain the provided comment', async (done) => {
    const postId = mockedNonValidPostId
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw NOT_FOUND (404) when provide a comment which is not contained into the selected post', async (done) => {
    const postId = selectedPost.id
    const commentId = mockedNonValidCommentId
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async (done) => {
    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedComment.id
    const commentOwnerId = selectedComment.owner.id
    const expectedError = new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${errorMessage}`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })
})
