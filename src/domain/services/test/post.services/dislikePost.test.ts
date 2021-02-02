import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel } from '@domainModels'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  cleanPostsCollectionFixture,
  savePostsFixture,
  getPostByIdFixture,
  testingNonValidPostId,
  testingNonValidLikeOwnerId
} from '@testingFixtures'

import { dislikePost } from '@domainServices'
import { DeletingPostLikeError, GettingPostError, GettingPostLikeError, PostNotFoundError } from '@errors'
import { PostDto } from '@infrastructure/dtos'

describe('[SERVICES] Post - dislikePost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const [mockedCompleteDtoPost, mockedEmptyLikesDtoPost] = mockedDtoPosts
  mockedEmptyLikesDtoPost.likes = []

  const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
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

  it('must delete the selected post like', async (done) => {
    const postId = selectedPost.id as string
    const likeOwnerId = selectedLikeOwnerId

    await dislikePost(postId, likeOwnerId)

    const { likes: updatedDtoLikes } = await getPostByIdFixture(postId) as PostDto

    expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length - 1)
    expect(updatedDtoLikes.map(({ userId }) => userId).includes(likeOwnerId)).toBeFalsy()

    done()
  })

  it('must not modify the selected post nor throw any error when the provided user has not liked the post', async (done) => {
    const postId = selectedPost.id as string
    const likeOwnerId = mockedNonValidLikeOwnerId

    await dislikePost(postId, likeOwnerId)

    const { likes: updatedDtoLikes } = await getPostByIdFixture(postId) as PostDto

    expect(updatedDtoLikes).toHaveLength(selectedPost.likes.length)

    done()
  })

  it('must throw NOT_FOUND (404) when the provided post ID doesn\'t exist', async (done) => {
    const postId = mockedNonValidPostId
    const likeOwnerId = selectedLikeOwnerId

    await expect(dislikePost(postId, likeOwnerId)).rejects.toThrowError(new PostNotFoundError(`Post '${postId}' not found`))

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource retrieving post by ID process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    await expect(dislikePost(postId, likeOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource retrieving post like by owner ID throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new GettingPostLikeError(`Error retereaving post comment. ${errorMessage}`)

    await expect(dislikePost(postId, likeOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource disliking process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'dislikePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const likeOwnerId = selectedLikeOwnerId
    const expectedError = new DeletingPostLikeError(`Error deleting like '${selectedLike.id}', from post '${postId}', by user '${likeOwnerId}'. ${errorMessage}`)

    await expect(dislikePost(postId, likeOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'dislikePost').mockRestore()

    done()
  })
})
