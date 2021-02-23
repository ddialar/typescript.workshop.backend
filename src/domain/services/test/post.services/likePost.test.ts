import { mongodb } from '@infrastructure/orm'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  savePostsFixture,
  cleanPostsCollectionFixture,
  testingNonValidPostId
} from '@testingFixtures'

import { likePost } from '@domainServices'
import { GettingPostError, LikingPostError, PostNotFoundError } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

describe('[SERVICES] Post - likePost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const [originalPost] = testingLikedAndCommentedPersistedDomainModelPosts
  const nonValidPostId = testingNonValidPostId

  beforeAll(async () => {
    await connect()
    await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must like the selected post and return the new updated document, liked by the indicated user', async (done) => {
    const postId = originalPost.id
    const [likeOwner] = testingDomainModelFreeUsers

    const updatedPost = await likePost(postId, likeOwner)

    expect(updatedPost.id).toBe(postId)
    expect(updatedPost.body).toBe(originalPost.body)
    expect(updatedPost.owner).toStrictEqual(originalPost.owner)
    expect(updatedPost.comments).toStrictEqual(originalPost.comments.map(comment => ({ ...comment, userIsOwner: false })))

    expect(updatedPost.userIsOwner).toBeFalsy()
    expect(updatedPost.userHasLiked).toBeTruthy()

    expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
    const originalLikesIds = originalPost.likes.map(({ id }) => id.toString())
    const updatedLikesIds = updatedPost.likes.map(({ id }) => id.toString())
    const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
    const newPersistedLike = updatedPost.likes.find((like) => like.id === newLikeId)!
    expect(newPersistedLike.id).toBe(likeOwner.id)
    expect(newPersistedLike.name).toBe(likeOwner.name)
    expect(newPersistedLike.surname).toBe(likeOwner.surname)
    expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

    expect(updatedPost.createdAt).toBe(originalPost.createdAt)
    expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

    done()
  })

  it('must throw NOT_FOUND (404) when the provided post ID does not exist', async (done) => {
    const postId = nonValidPostId
    const [likeOwner] = testingDomainModelFreeUsers

    await expect(likePost(postId, likeOwner)).rejects.toThrowError(new PostNotFoundError(`Post '${postId}' not found`))

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the retrieving post process throws an error', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = originalPost.id
    const [likeOwner] = testingDomainModelFreeUsers
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    try {
      await likePost(postId, likeOwner)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the liking process throws an exception', async (done) => {
    jest.spyOn(postDataSource, 'likePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = originalPost.id
    const [likeOwner] = testingDomainModelFreeUsers
    const expectedError = new LikingPostError(`Error setting like to post '${postId}' by user '${likeOwner.id}'. ${errorMessage}`)

    try {
      await likePost(postId, likeOwner)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'likePost').mockRestore()

    done()
  })
})
