import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostCommentDomainModel } from '@domainModels'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, savePostsFixture, cleanPostsCollectionFixture, testingNonValidPostId } from '@testingFixtures'

import { getPostComment } from '@domainServices'
import { GettingPostCommentError, PostNotFoundError } from '@errors'

describe('[SERVICES] Post - getPostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
  const { 1: mockedNonValidPost } = mockedPosts
  const { _id: mockedNonValidPostId } = mockedNonValidPost
  const [{ _id: mockedNonValidCommentId }] = mockedNonValidPost.comments

  const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts
  const [selectedComment] = selectedPost.comments

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post comment', async () => {
    const postId = selectedPost.id
    const commentId = selectedComment.id

    const persistedComment = (await getPostComment(postId, commentId))!

    const expectedFields = ['id', 'body', 'owner', 'createdAt', 'updatedAt'].sort()
    expect(Object.keys(persistedComment).sort()).toEqual(expectedFields)

    expect(persistedComment).toStrictEqual<PostCommentDomainModel>(selectedComment)
  })

  it('must return NULL when select a post which doesn\'t contain the provided comment', async () => {
    const postId = mockedNonValidPostId
    const commentId = selectedComment.id

    await expect(getPostComment(postId, commentId)).resolves.toBeNull()
  })

  it('must return NULL when provide a comment which is not contained into the selected post', async () => {
    const postId = selectedPost.id
    const commentId = mockedNonValidCommentId

    await expect(getPostComment(postId, commentId)).resolves.toBeNull()
  })

  it('must throw a NOT_FOUND (404) when the provided post does not exist', async () => {
    const postId = testingNonValidPostId
    const commentId = selectedComment.id
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(getPostComment(postId, commentId)).rejects.toThrowError(expectedError)
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async () => {
    jest.spyOn(postDataSource, 'getPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedComment.id
    const expectedError = new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`)

    try {
      await getPostComment(postId, commentId)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostComment').mockRestore()
  })
})
