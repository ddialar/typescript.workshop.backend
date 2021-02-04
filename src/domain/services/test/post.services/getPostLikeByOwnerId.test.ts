import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostLikeDomainModel } from '@domainModels'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, savePostsFixture, cleanPostsCollectionFixture, testingNonValidPostId, testingNonValidLikeOwnerId } from '@testingFixtures'

import { getPostLikeByOwnerId } from '@domainServices'
import { GettingPostLikeError } from '@errors'

describe('[SERVICES] Post - getPostLikeByOwnerId', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts
  const [mockedCompleteDtoPost, mockedEmptyLikesDtoPost] = mockedDtoPosts
  mockedEmptyLikesDtoPost.likes = []

  const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts
  const [selectedPost] = resultPosts
  const [selectedLike] = selectedPost.likes
  const { id: selectedLikeOwnerId } = selectedLike
  const mockedNonValidPostId = testingNonValidPostId
  const mockedNonValidLikeOwnerId = testingNonValidLikeOwnerId

  beforeAll(async () => {
    await connect()
    await savePostsFixture([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post like', async (done) => {
    const postId = selectedPost.id
    const ownerId = selectedLikeOwnerId

    const persistedLike = (await getPostLikeByOwnerId(postId, ownerId))!

    const expectedFields = ['id', 'name', 'surname', 'avatar']
    const persistedLikeFields = Object.keys(persistedLike).sort()
    expect(persistedLikeFields.sort()).toEqual(expectedFields.sort())

    expect(persistedLike).toStrictEqual<PostLikeDomainModel>(selectedLike)

    done()
  })

  it('must return NULL when select a post which doesn\'t contain the provided like', async (done) => {
    const postId = mockedNonValidPostId
    const ownerId = selectedLikeOwnerId

    await expect(getPostLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when provide user who has not liked the selected post', async (done) => {
    const postId = selectedPost.id
    const ownerId = mockedNonValidLikeOwnerId

    await expect(getPostLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id
    const commentId = selectedLike.id
    const expectedError = new GettingPostLikeError(`Error retereaving post comment. ${errorMessage}`)

    await expect(getPostLikeByOwnerId(postId, commentId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockRestore()

    done()
  })
})
