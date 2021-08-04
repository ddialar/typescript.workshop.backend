import { lorem } from 'faker'
import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  cleanPostsCollectionFixture,
  savePostsFixture,
  testingNonValidPostId,
  generateMockedMongoDbId
} from '@testingFixtures'

import { deletePostComment } from '@domainServices'
import {
  DeletingPostCommentError,
  GettingPostCommentError,
  PostCommentNotFoundError,
  PostNotFoundError,
  UnauthorizedPostCommentDeletingError
} from '@errors'
import { PostCommentDto } from '@infrastructure/dtos'
import { PostCommentDomainModel } from '@domainModels'

describe('[SERVICES] Post - deletePostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'

  const [selectedPostDto, secondaryPostDto] = testingLikedAndCommentedPersistedDtoPosts
  const postOwnerCommentDto: PostCommentDto = {
    _id: generateMockedMongoDbId(),
    body: lorem.paragraph(),
    owner: selectedPostDto.owner,
    createdAt: (new Date()).toISOString().replace(/\dZ/, '0Z'),
    updatedAt: (new Date()).toISOString().replace(/\dZ/, '0Z')
  }
  const selectedPostDtoToBePersisted = { ...selectedPostDto, comments: [...selectedPostDto.comments, postOwnerCommentDto] }

  const { _id: secondaryPostDtoId } = secondaryPostDto
  const [{ _id: mockedNonValidCommentId }] = secondaryPostDto.comments

  const [selectedPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts
  const postOwnerCommentDomainModel: PostCommentDomainModel = {
    id: postOwnerCommentDto._id!,
    body: postOwnerCommentDto.body,
    owner: selectedPostDomainModel.owner,
    createdAt: postOwnerCommentDto.createdAt,
    updatedAt: postOwnerCommentDto.updatedAt
  }
  const expectedPostDomainModel = { ...selectedPostDomainModel, comments: [...selectedPostDomainModel.comments, postOwnerCommentDomainModel] }
  const [selectedOtherOwnerComment] = expectedPostDomainModel.comments

  const [{ id: unauthorizedUserId }] = testingDomainModelFreeUsers

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
    await savePostsFixture([selectedPostDtoToBePersisted, secondaryPostDto])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('deletes the selected post comment successfully, when the comment and the post owners are the same one', async () => {
    const postId = selectedPostDomainModel.id
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id

    const { userIsOwner, comments: updatedDtoComments } = await deletePostComment(postId, commentId, commentOwnerId)

    expect(userIsOwner).toBeFalsy()
    expect(updatedDtoComments).toHaveLength(expectedPostDomainModel.comments.length - 1)
    expect(updatedDtoComments.map(({ id }) => id).includes(commentId)).toBeFalsy()
  })

  it('deletes the selected post comment successfully, when the comment owner is different to the post one', async () => {
    const postId = selectedPostDomainModel.id
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id

    const { userIsOwner, comments: updatedDtoComments } = await deletePostComment(postId, commentId, commentOwnerId)

    expect(userIsOwner).toBeFalsy()
    expect(updatedDtoComments).toHaveLength(expectedPostDomainModel.comments.length - 1)
    expect(updatedDtoComments.map(({ id }) => id).includes(commentId)).toBeFalsy()
  })

  it('throws UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the comment', async () => {
    const postId = selectedPostDomainModel.id
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostCommentDeletingError(`User '${commentOwnerId}' is not the owner of the comment '${commentId}', from post '${postId}', which is trying to delete.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)
  })

  it('throws NOT_FOUND (404) when the provided post does not exist', async () => {
    const postId = testingNonValidPostId
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)
  })

  it('throws NOT_FOUND (404) when we select a post which does not contain the provided comment', async () => {
    const postId = secondaryPostDtoId
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)
  })

  it('throws NOT_FOUND (404) when provide a comment which is not contained into the selected post', async () => {
    const postId = selectedPostDomainModel.id
    const commentId = mockedNonValidCommentId
    const commentOwnerId = selectedOtherOwnerComment.owner.id
    const expectedError = new PostCommentNotFoundError(`Comment '${commentId}' from post '${postId}' not found`)

    await expect(deletePostComment(postId, commentId, commentOwnerId)).rejects.toThrowError(expectedError)
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the retrieving post comment datasource throws an unexpected error', async () => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPostDomainModel.id
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id
    const expectedError = new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`)

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostComment').mockRestore()
  })

  it('throws INTERNAL_SERVER_ERROR (500) when the deleting process datasource throws an unexpected error', async () => {
    jest.spyOn(postDataSource, 'deletePostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPostDomainModel.id
    const commentId = selectedOtherOwnerComment.id!
    const commentOwnerId = selectedOtherOwnerComment.owner.id
    const expectedError = new DeletingPostCommentError(`Error deleting comment '${commentId}', from post '${postId}', by user '${commentOwnerId}'. ${errorMessage}`)

    try {
      await deletePostComment(postId, commentId, commentOwnerId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'deletePostComment').mockRestore()
  })
})
