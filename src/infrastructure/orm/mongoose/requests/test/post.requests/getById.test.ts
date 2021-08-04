import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  savePostsFixture,
  cleanPostsCollectionFixture,
  testingNonValidPostId
} from '@testingFixtures'

import { getById } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getById', () => {
  const [selectedPost] = testingLikedAndCommentedPersistedDtoPosts
  const nonValidPostId = testingNonValidPostId

  beforeAll(async () => {
    await connect()
    await savePostsFixture(testingLikedAndCommentedPersistedDtoPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post', async () => {
    const postId = selectedPost._id

    const persistedPost = (await getById(postId))!

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedPost))).toStrictEqual<PostDto>(selectedPost)
  })

  it('must return NULL when the provided post ID doesn\'t exist', async () => {
    const postId = nonValidPostId

    await expect(getById(postId)).resolves.toBeNull()
  })
})
