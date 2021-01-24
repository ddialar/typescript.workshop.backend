import { connect, disconnect } from '../../../core'
import { PostDto, PostLikeOwnerDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePosts, cleanPostsCollection } from '@testingFixtures'

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
    await savePosts([mockedCompleteDtoPost, mockedEmptyLikesDtoPost])
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must retrieve the selected post like', async (done) => {
    const postId = selectedPost._id as string
    const ownerId = selectedLikeOwnerId

    const persistedLike = await getLikeByOwnerId(postId, ownerId) as PostLikeOwnerDto

    const expectedFields = ['_id', 'userId', 'name', 'surname', 'avatar', 'createdAt', 'updatedAt']
    const persistedLikeFields = Object.keys(persistedLike).sort()
    expect(persistedLikeFields.sort()).toEqual(expectedFields.sort())

    expect(persistedLike).toStrictEqual<PostLikeOwnerDto>(selectedLike)

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
