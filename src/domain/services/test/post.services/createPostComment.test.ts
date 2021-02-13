import { lorem } from 'faker'
import { mongodb } from '@infrastructure/orm'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  savePostsFixture,
  cleanPostsCollectionFixture
} from '@testingFixtures'

import { createPostComment } from '@domainServices'
import { CreatingPostCommentError } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

describe('[SERVICES] Post - createPostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDomainModelPosts
  const [originalPost] = mockedPosts
  const [newPostCommentOwner] = testingDomainModelFreeUsers

  beforeAll(async () => {
    await connect()
    await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new comment into the selected post', async (done) => {
    const { id: postId } = originalPost
    const newPostComment = lorem.paragraph()

    const updatedPost = await createPostComment(postId, newPostComment, newPostCommentOwner)

    const expectedPostFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const updatedPostFields = Object.keys(updatedPost).sort()
    expect(updatedPostFields.sort()).toEqual(expectedPostFields.sort())

    expect(updatedPost.id).toBe(originalPost.id)
    expect(updatedPost.body).toBe(originalPost.body)

    const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar']
    const createPostCommentdOwnerPostFields = Object.keys(updatedPost.owner).sort()
    expect(createPostCommentdOwnerPostFields.sort()).toEqual(expectedPostOwnerFields.sort())
    expect(updatedPost.owner).toStrictEqual(originalPost.owner)

    expect(updatedPost.comments).toHaveLength(originalPost.comments.length + 1)
    const originalCommentsIds = originalPost.comments.map(({ id }) => id.toString())
    const updatedCommentsIds = updatedPost.comments.map(({ id }) => id?.toString())
    const newPostId = updatedCommentsIds.find((updatedId) => !originalCommentsIds.includes(updatedId!))
    const newPersistedComment = updatedPost.comments.find((comment) => comment.id === newPostId)!
    expect(newPersistedComment.body).toBe(newPostComment)
    expect(newPersistedComment.owner).toStrictEqual(newPostCommentOwner)

    expect(updatedPost.likes).toStrictEqual(originalPost.likes)

    expect(updatedPost.createdAt).toBe(originalPost.createdAt)
    expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
    jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => Promise.resolve(null))

    const { id: postId } = originalPost
    const newPostComment = lorem.paragraph()
    const message = 'Post comment insertion process initiated but completed with NULL result'
    const expectedError = new CreatingPostCommentError(`Error creating post '${postId}' commment by user '${newPostCommentOwner.id}'. ${message}`)

    await expect(createPostComment(postId, newPostComment, newPostCommentOwner)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'createPostComment').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
    jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { id: postId } = originalPost
    const newPostComment = lorem.paragraph()
    const expectedError = new CreatingPostCommentError(`Error creating post '${postId}' commment by user '${newPostCommentOwner.id}'. ${errorMessage}`)

    try {
      await createPostComment(postId, newPostComment, newPostCommentOwner)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'createPostComment').mockRestore()

    done()
  })
})
