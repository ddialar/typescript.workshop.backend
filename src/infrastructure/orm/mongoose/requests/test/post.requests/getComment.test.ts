import { connect, disconnect } from '../../../core'
import { PostCommentDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, testingNonValidPostCommentId, testingNonValidPostId } from '@testingFixtures'

import { getComment } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - getComment', () => {
  const [selectedPost, completeDtoPostWithNoComments] = testingLikedAndCommentedPersistedDtoPosts

  const { _id: selectedPostId } = selectedPost
  const [selectedComment] = selectedPost.comments
  const { _id: selectedCommentId } = selectedComment

  const { _id: noCommentsPostId } = completeDtoPostWithNoComments
  completeDtoPostWithNoComments.comments = []

  const mockedNonValidPostId = testingNonValidPostId
  const mockedNonValidCommentId = testingNonValidPostCommentId

  beforeAll(async () => {
    await connect()
    await savePostsFixture([selectedPost, completeDtoPostWithNoComments])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the selected post comment', async () => {
    const postId = selectedPostId!
    const commentId = selectedCommentId!

    const persistedComment = (await getComment(postId, commentId))!

    const expectedFields = ['_id', 'body', 'owner', 'createdAt', 'updatedAt']
    const persistedCommentFields = Object.keys(persistedComment).sort()
    expect(persistedCommentFields.sort()).toEqual(expectedFields.sort())

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(persistedComment))).toStrictEqual<PostCommentDto>(selectedComment)
  })

  it('must return NULL when the selected post doesn\'t exist', async () => {
    const postId = mockedNonValidPostId
    const commentId = selectedCommentId!

    await expect(getComment(postId, commentId)).resolves.toBeNull()
  })

  it('must return NULL when select a post which doesn\'t contain the provided comment', async () => {
    const postId = noCommentsPostId!
    const commentId = selectedCommentId!

    await expect(getComment(postId, commentId)).resolves.toBeNull()
  })

  it('must return NULL when provide a comment which is not contained into the selected post', async () => {
    const postId = selectedPostId!
    const commentId = mockedNonValidCommentId

    await expect(getComment(postId, commentId)).resolves.toBeNull()
  })
})
