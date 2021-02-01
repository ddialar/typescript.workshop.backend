import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getById } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getById', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = mockedPosts[0]
  const nonValidPostId = selectedPost.comments[0]._id as string

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post', async (done) => {
    const postId = selectedPost._id as string

    const persistedPost = await getById(postId) as PostDto

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedPost))).toStrictEqual<PostDto>(selectedPost)

    done()
  })

  it('must return NULL when the provided post ID doesn\'t exist', async (done) => {
    const postId = nonValidPostId

    await expect(getById(postId)).resolves.toBeNull()

    done()
  })
})
