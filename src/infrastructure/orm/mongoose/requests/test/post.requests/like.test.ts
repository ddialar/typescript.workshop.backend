import { connect, disconnect } from '../../../core'
import { testingLikedAndCommentedPersistedDtoPosts, testingDtoFreeUsers, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { like } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - like', () => {
  const [selectedPost] = testingLikedAndCommentedPersistedDtoPosts

  beforeAll(async () => {
    await connect()
    await savePostsFixture([selectedPost])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new like into the selected post', async (done) => {
    const { _id: postId } = selectedPost
    const [likeOwner] = testingDtoFreeUsers

    const updatedPost = await like(postId, likeOwner)

    const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const updatedPostFields = Object.keys(updatedPost).sort()
    expect(updatedPostFields.sort()).toEqual(expectedFields.sort())

    expect(updatedPost._id?.toString()).toBe(postId)
    expect(updatedPost.body).toBe(selectedPost.body)
    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(updatedPost.owner))).toStrictEqual(selectedPost.owner)
    expect(JSON.parse(JSON.stringify(updatedPost.comments))).toStrictEqual(selectedPost.comments)

    expect(updatedPost.likes).toHaveLength(selectedPost.likes.length + 1)
    const originalLikesIds = selectedPost.likes.map(({ _id }) => _id?.toString())
    const updatedLikesIds = updatedPost.likes.map(({ _id }) => _id?.toString())
    const newLikeId = updatedLikesIds.find((updatedId) => !originalLikesIds.includes(updatedId))
    const newPersistedLike = updatedPost.likes.find((like) => like._id?.toString() === newLikeId)!
    expect(newPersistedLike.userId).toBe(likeOwner.userId)
    expect(newPersistedLike.name).toBe(likeOwner.name)
    expect(newPersistedLike.surname).toBe(likeOwner.surname)
    expect(newPersistedLike.avatar).toBe(likeOwner.avatar)

    expect((new Date(updatedPost.createdAt!)).toISOString()).toBe(selectedPost.createdAt)
    expect((new Date(updatedPost.updatedAt!)).toISOString()).not.toBe(selectedPost.updatedAt)

    done()
  })
})
