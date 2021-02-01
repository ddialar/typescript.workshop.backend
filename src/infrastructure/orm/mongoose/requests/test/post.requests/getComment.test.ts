import { connect, disconnect } from '../../../core'
import { PostCommentDto, PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getComment } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getComment', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = mockedPosts[0]
  const selectedComment = selectedPost.comments[0]
  const mockedNonValidPostId = mockedPosts[1]._id as string
  const mockedNonValidCommentId = mockedPosts[1].comments[0]._id as string

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post comment', async (done) => {
    const postId = selectedPost._id as string
    const commentId = selectedComment._id as string

    const persistedComment = await getComment(postId, commentId) as PostCommentDto

    const expectedFields = ['_id', 'body', 'owner', 'createdAt', 'updatedAt']
    const persistedCommentFields = Object.keys(persistedComment).sort()
    expect(persistedCommentFields.sort()).toEqual(expectedFields.sort())

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedComment))).toStrictEqual<PostCommentDto>(selectedComment)

    done()
  })

  it('must return NULL when select a post which doesn\'t contain the provided comment', async (done) => {
    const postId = mockedNonValidPostId
    const commentId = selectedComment._id as string

    await expect(getComment(postId, commentId)).resolves.toBeNull()

    done()
  })

  it('must return NULL when provide a comment which is not contained into the selected post', async (done) => {
    const postId = selectedPost._id as string
    const commentId = mockedNonValidCommentId

    await expect(getComment(postId, commentId)).resolves.toBeNull()

    done()
  })
})
