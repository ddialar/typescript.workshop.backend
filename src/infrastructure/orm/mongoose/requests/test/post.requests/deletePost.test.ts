import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePosts, cleanPostsCollection, getPostById } from '@testingFixtures'

import { deletePost } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - deletePost', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = mockedPosts[0]

  beforeAll(async () => {
    await connect()
    await savePosts(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must delete the selected post', async (done) => {
    const postId = selectedPost._id as string

    await deletePost(postId)

    const retrievedPost = await getPostById(postId)

    expect(retrievedPost).toBeNull()

    done()
  })
})
