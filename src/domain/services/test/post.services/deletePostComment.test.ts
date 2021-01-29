import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel, UserDomainModel } from '@domainModels'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  cleanPostsCollection,
  savePosts,
  getPostById
} from '@testingFixtures'

import { deletePostComment } from '@domainServices'
import { DeletingPostCommentError, GettingPostCommentError, PostCommentNotFoundError, UnauthorizedPostCommentDeletingError } from '@errors'
import { PostDto } from '@infrastructure/dtos'

describe('[SERVICES] Post - deletePostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const { 1: mockedNonValidPost } = mockedPosts
  const { _id: mockedNonValidPostId } = mockedNonValidPost
  const [{ _id: mockedNonValidCommentId }] = mockedNonValidPost.comments

  const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
  const [selectedComment] = selectedPost.comments

  const [{ id: unauthorizedUserId }] = testingDomainModelFreeUsers as UserDomainModel[]

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollection()
    await savePosts(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must delete the selected post comment', async (done) => {
    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string

    await deletePostComment(postId, commentId, commentOwnerId)

    const { comments: updatedDtoComments } = await getPostById(postId) as PostDto

    expect(updatedDtoComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedDtoComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()

    done()
  })

  it('must throw NOT_FOUND (404) when we select a post which doesn\'t contain the provided comment', async (done) => {
    const postId = mockedNonValidPostId as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw NOT_FOUND (404) when provide a comment which is not contained into the selected post', async (done) => {
    const postId = selectedPost.id as string
    const commentId = mockedNonValidCommentId as string
    const commentOwnerId = selectedComment.owner.id as string
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async (done) => {
    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string
    const expectedError = new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string
    const expectedError = new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${errorMessage}`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })
})
