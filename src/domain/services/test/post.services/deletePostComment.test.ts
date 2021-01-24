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

  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = testingLikedAndCommentedPersistedDomainModelPosts[0] as PostDomainModel
  const selectedComment = selectedPost.comments[0]
  const mockedNonValidPostId = mockedPosts[1]._id as string
  const mockedNonValidCommentId = mockedPosts[1].comments[0]._id as string
  const { id: unauthorizedUserId } = testingDomainModelFreeUsers[0] as UserDomainModel

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
    const postId = mockedNonValidPostId
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`))

    done()
  })

  it('must throw NOT_FOUND (404) when provide a comment which is not contained into the selected post', async (done) => {
    const postId = selectedPost.id as string
    const commentId = mockedNonValidCommentId
    const commentOwnerId = selectedComment.owner.id as string

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`))

    done()
  })

  it('must throw UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async (done) => {
    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = unauthorizedUserId

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`))

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error('Testing error')
    })

    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error).toStrictEqual(new GettingPostCommentError(`Error retereaving post comment. ${error.message}`))
    }

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
      throw new Error('Testing error')
    })

    const postId = selectedPost.id as string
    const commentId = selectedComment.id as string
    const commentOwnerId = selectedComment.owner.id as string

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error).toStrictEqual(new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${error.message}`))
    }

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()

    done()
  })
})
