import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel, PostLikeOwnerDomainModel } from '@domainModels'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, testingDomainModelFreeUsers, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getPostLikeByOwnerId } from '@domainServices'
import { GettingPostLikeError } from '@errors'
import { PostDto } from '@infrastructure/dtos'

describe('[SERVICES] Post - getPostLikeByOwnerId', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const [mockedCompleteDtoPost, mockedEmptyLikesDtoPost] = mockedDtoPosts
  mockedEmptyLikesDtoPost.likes = []

  const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
  const [selectedPost] = resultPosts
  const [selectedLike] = selectedPost.likes
  const { id: selectedLikeOwnerId } = selectedLike
  const mockedNonValidPostId = resultPosts[1].id as string
  const mockedNonValidLikeOwnerId = testingDomainModelFreeUsers[0].id

  beforeAll(async () => {
    await connect()
    await savePostsFixture([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post like', async (done) => {
    const postId = selectedPost.id as string
    const ownerId = selectedLikeOwnerId

    const persistedLike = await getPostLikeByOwnerId(postId, ownerId) as PostLikeOwnerDomainModel

    const expectedFields = ['id', 'name', 'surname', 'avatar']
    const persistedLikeFields = Object.keys(persistedLike).sort()
    expect(persistedLikeFields.sort()).toEqual(expectedFields.sort())

    expect(persistedLike).toStrictEqual<PostLikeOwnerDomainModel>(selectedLike)

    done()
  })

  it('must return NULL when select a post which doesn\'t contain the provided like', async (done) => {
    const postId = mockedNonValidPostId
    const ownerId = selectedLikeOwnerId

    await expect(getPostLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when provide user who has not liked the selected post', async (done) => {
    const postId = selectedPost.id as string
    const ownerId = mockedNonValidLikeOwnerId

    await expect(getPostLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const commentId = selectedLike.id as string
    const expectedError = new GettingPostLikeError(`Error retereaving post comment. ${errorMessage}`)

    await expect(getPostLikeByOwnerId(postId, commentId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPostLikeByOwnerId').mockRestore()

    done()
  })
})
