import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, getPostByIdFixture } from '@testingFixtures'

import { deletePost } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - deletePost', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = mockedPosts[0]

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
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
