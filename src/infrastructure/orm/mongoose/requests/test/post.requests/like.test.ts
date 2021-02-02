import { connect, disconnect } from '../../../core'
import { PostDto, PostLikeDto } from '@infrastructure/dtos'
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

  it.only('must persist the new like into the selected post', async (done) => {
    const [originalPost] = mockedPosts
    const { _id: postId } = originalPost
    const [likeOwner] = testingDtoFreeUsers

    const updatedPost = await like(postId as string, likeOwner) as PostDto

    const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const updatedPostFields = Object.keys(updatedPost).sort()
    expect(updatedPostFields.sort()).toEqual(expectedFields.sort())

    expect(updatedPost._id).not.toBeNull()
    expect(updatedPost.body).toBe(originalPost.body)
    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(updatedPost.owner))).toStrictEqual(originalPost.owner)
    expect(JSON.parse(JSON.stringify(updatedPost.comments))).toStrictEqual(originalPost.comments)

    expect(updatedPost.likes).toHaveLength(originalPost.likes.length + 1)
    const originalLikesIds = originalPost.likes.map(({ _id }) => _id?.toString())
    const updatedLikesIds = updatedPost.likes.map(({ _id }) => _id?.toString())
    const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
    const newPersistedLike = updatedPost.likes.find((like) => like._id?.toString() === newLikeId) as PostLikeDto
    expect(newPersistedLike.userId).toBe(likeOwner.userId)
    expect(newPersistedLike.name).toBe(likeOwner.name)
    expect(newPersistedLike.surname).toBe(likeOwner.surname)
    expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

    expect((new Date(updatedPost.createdAt!)).toISOString()).toBe(originalPost.createdAt)
    expect((new Date(updatedPost.updatedAt!)).toISOString()).not.toBe(originalPost.updatedAt)

    done()
  })
})
