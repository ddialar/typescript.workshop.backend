import { connect, disconnect } from '../../../core'
import { PostLikeDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, testingNonValidLikeOwnerId, testingNonValidPostId } from '@testingFixtures'

import { getLikeByOwnerId } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getLikeByOwnerId', () => {
  const [selectedPost, completeDtoPostWithNoLikes] = testingLikedAndCommentedPersistedDtoPosts

  const { _id: selectedPostId } = selectedPost
  const [selectedLike] = selectedPost.likes
  const { userId: selectedLikeOwnerId } = selectedLike

  const { _id: noLikesPostId } = completeDtoPostWithNoLikes
  completeDtoPostWithNoLikes.likes = []

  const mockedNonValidPostId = testingNonValidPostId
  const nonValidLikeOwnerId = testingNonValidLikeOwnerId

  beforeAll(async () => {
    await connect()
    await savePostsFixture([selectedPost, completeDtoPostWithNoLikes])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post like', async (done) => {
    const postId = selectedPostId!
    const ownerId = selectedLikeOwnerId

    const persistedLike = (await getLikeByOwnerId(postId, ownerId))!

    const expectedFields = ['_id', 'userId', 'name', 'surname', 'avatar', 'createdAt', 'updatedAt']
    const persistedLikeFields = Object.keys(persistedLike).sort()
    expect(persistedLikeFields.sort()).toEqual(expectedFields.sort())

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedLike))).toStrictEqual<PostLikeDto>(selectedLike)

    done()
  })

  it('must return NULL when the selected post doesn\'t exist', async (done) => {
    const postId = mockedNonValidPostId
    const ownerId = selectedLikeOwnerId

    await expect(getLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when select a post which doesn\'t contain the provided like', async (done) => {
    const postId = noLikesPostId!
    const ownerId = selectedLikeOwnerId

    await expect(getLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when provide user who has not liked the selected post', async (done) => {
    const postId = selectedPostId!
    const ownerId = nonValidLikeOwnerId

    await expect(getLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })
})
