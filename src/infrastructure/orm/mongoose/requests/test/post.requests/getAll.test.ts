import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getAll } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getAll', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the whole persisted posts', async (done) => {
    const persistedPosts = (await getAll())!

    expect(persistedPosts).toHaveLength(persistedPosts.length)

    persistedPosts.forEach((post) => {
      const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
      const getAlldPostFields = Object.keys(post).sort()
      expect(getAlldPostFields.sort()).toEqual(expectedFields.sort())

      const expectedPost = mockedPosts.find((mockedPost) => mockedPost._id === post._id?.toString())!

      // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
      expect(JSON.parse(JSON.stringify(post))).toStrictEqual<PostDto>(expectedPost)
    })

    done()
  })
})
