import { connect, disconnect } from '../../../core'
import { PostDto, PostLikeOwnerDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, testingDtoFreeUsers, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { like } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - like', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new like into the selected post', async (done) => {
    const originalPost = mockedPosts[0] as PostDto
    const { _id: postId } = originalPost
    const likeOwner = testingDtoFreeUsers[0] as PostLikeOwnerDto

    const updatedPost = await like(postId as string, likeOwner) as PostDto

    const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const updatedPostFields = Object.keys(updatedPost).sort()
    expect(updatedPostFields.sort()).toEqual(expectedFields.sort())

    expect(updatedPost._id).not.toBeNull()
    expect(updatedPost.body).toBe(originalPost.body)
    expect(updatedPost.owner).toStrictEqual(originalPost.owner)
    expect(updatedPost.comments).toStrictEqual(originalPost.comments)

    expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
    const originalLikesIds = originalPost.likes.map(({ _id }) => _id as string)
    const updatedLikesIds = updatedPost.likes.map(({ _id }) => _id as string)
    const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
    const newPersistedLike = updatedPost.likes.find((like) => like._id === newLikeId) as PostLikeOwnerDto
    expect(newPersistedLike.userId).toBe(likeOwner.userId)
    expect(newPersistedLike.name).toBe(likeOwner.name)
    expect(newPersistedLike.surname).toBe(likeOwner.surname)
    expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

    expect(updatedPost.createdAt).toBe(originalPost.createdAt)
    expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

    done()
  })
})
