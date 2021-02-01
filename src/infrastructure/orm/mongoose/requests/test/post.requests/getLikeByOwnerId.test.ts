import { connect, disconnect } from '../../../core'
import { PostDto, PostLikeDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getLikeByOwnerId } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getLikeByOwnerId', () => {
  const mockedDtoPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const mockedCompleteDtoPost = JSON.parse(JSON.stringify(mockedDtoPosts[0]))
  const mockedEmptyLikesDtoPost = JSON.parse(JSON.stringify(mockedDtoPosts[1]))
  mockedEmptyLikesDtoPost.likes = []

  const selectedPost = mockedCompleteDtoPost
  const selectedLike = selectedPost.likes[0]
  const selectedLikeOwnerId = selectedLike.userId
  const mockedNonValidPostId = mockedEmptyLikesDtoPost._id as string
  const mockedNonValidLikeOwnerId = mockedEmptyLikesDtoPost.owner._id as string

  beforeAll(async () => {
    await connect()
    await savePostsFixture([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post like', async (done) => {
    const postId = selectedPost._id as string
    const ownerId = selectedLikeOwnerId

    const persistedLike = await getLikeByOwnerId(postId, ownerId) as PostLikeDto

    const expectedFields = ['_id', 'userId', 'name', 'surname', 'avatar', 'createdAt', 'updatedAt']
    const persistedLikeFields = Object.keys(persistedLike).sort()
    expect(persistedLikeFields.sort()).toEqual(expectedFields.sort())

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedLike))).toStrictEqual<PostLikeDto>(selectedLike)

    done()
  })

  it('must return NULL when select a post which doesn\'t contain the provided like', async (done) => {
    const postId = mockedNonValidPostId
    const ownerId = selectedLikeOwnerId

    await expect(getLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when provide user who has not liked the selected post', async (done) => {
    const postId = selectedPost._id as string
    const ownerId = mockedNonValidLikeOwnerId

    await expect(getLikeByOwnerId(postId, ownerId)).resolves.toBeNull()

    done()
  })
})
