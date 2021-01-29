import { mongodb } from '@infrastructure/orm'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, testingDomainModelFreeUsers, savePosts, cleanPostsCollection, getPostById } from '@testingFixtures'

import { likePost } from '@domainServices'
import { PostDomainModel, PostLikeOwnerDomainModel } from '@domainModels'
import { GettingPostCommentError, LikingPostError, PostNotFoundError } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'
import { mapPostFromDtoToDomainModel } from '@infrastructure/mappers'
import { PostDto } from '@infrastructure/dtos'

describe('[SERVICES] Post - likePost', () => {
  const { connect, disconnect } = mongodb

  const [originalPost] = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
  const nonValidPostId = originalPost.comments[0].id as string

  beforeAll(async () => {
    await connect()
    await savePosts(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must persist the new like into the selected post', async (done) => {
    const postId = originalPost.id as string
    const likeOwner = testingDomainModelFreeUsers[0] as PostLikeOwnerDomainModel

    await likePost(postId, likeOwner)

    const updatedPost = mapPostFromDtoToDomainModel(await getPostById(postId) as PostDto) as PostDomainModel

    expect(updatedPost.id).not.toBeNull()
    expect(updatedPost.body).toBe(originalPost.body)
    expect(updatedPost.owner).toStrictEqual(originalPost.owner)
    expect(updatedPost.comments).toStrictEqual(originalPost.comments)

    expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
    const originalLikesIds = originalPost.likes.map(({ id }) => id as string)
    const updatedLikesIds = updatedPost.likes.map(({ id }) => id as string)
    const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
    const newPersistedLike = updatedPost.likes.find((like) => like.id === newLikeId) as PostLikeOwnerDomainModel
    expect(newPersistedLike.id).toBe(likeOwner.id)
    expect(newPersistedLike.name).toBe(likeOwner.name)
    expect(newPersistedLike.surname).toBe(likeOwner.surname)
    expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

    expect(updatedPost.createdAt).toBe(originalPost.createdAt)
    expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

    done()
  })

  it('must throw NOT_FOUND (404) when the provided post ID doesn\'t exist', async (done) => {
    const postId = nonValidPostId
    const likeOwner = testingDomainModelFreeUsers[0] as PostLikeOwnerDomainModel

    await expect(likePost(postId, likeOwner)).rejects.toThrowError(new PostNotFoundError(`Post '${postId}' not found`))

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the retrieving post pocess throws an error', async (done) => {
    const errorMessage = 'Testing error'

    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = originalPost.id as string
    const likeOwner = testingDomainModelFreeUsers[0] as PostLikeOwnerDomainModel

    await expect(likePost(postId, likeOwner)).rejects.toThrowError(new GettingPostCommentError(`Error retereaving post comment. ${errorMessage}`))

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the liking process throws an exception', async (done) => {
    const errorMessage = 'Testing error'

    jest.spyOn(postDataSource, 'likePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = originalPost.id as string
    const likeOwner = testingDomainModelFreeUsers[0] as PostLikeOwnerDomainModel

    await expect(likePost(postId, likeOwner)).rejects.toThrowError(new LikingPostError(`Error setting like to post '${postId}' by user '${likeOwner.id}'. ${errorMessage}`))

    jest.spyOn(postDataSource, 'likePost').mockRestore()

    done()
  })
})
