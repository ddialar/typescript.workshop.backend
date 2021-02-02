import { connect, disconnect } from '../../../core'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, getPostByIdFixture } from '@testingFixtures'

import { deletePost } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - deletePost', () => {
  const [selectedPost] = testingLikedAndCommentedPersistedDtoPosts

  beforeAll(async () => {
    await connect()
    await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must delete the selected post', async (done) => {
    const postId = selectedPost._id as string

    await deletePost(postId)

    const retrievedPost = await getPostByIdFixture(postId)

    expect(retrievedPost).toBeNull()

    done()
  })
})
