import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, getPostByIdFixture } from '@testingFixtures'

import { dislike } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - dislike', () => {
  const [selectedPost] = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const [selectedLike] = selectedPost.likes

  beforeAll(async () => {
    await connect()
    await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must delete the selected post like', async (done) => {
    const postId = selectedPost._id as string
    const userId = selectedLike.userId

    await dislike(postId, userId)

    const { likes: updatedLikes } = await getPostByIdFixture(postId) as PostDto

    expect(updatedLikes).toHaveLength(selectedPost.likes.length - 1)
    expect(updatedLikes.map(({ userId: updatedUserId }) => updatedUserId).includes(userId)).toBeFalsy()

    done()
  })
})
