import { connect, disconnect } from '../../../core'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture, getPostByIdFixture } from '@testingFixtures'

import { deleteComment } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - deleteComment', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
  const [selectedPost] = mockedPosts
  const [selectedComment] = selectedPost.comments

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must delete the selected post comment', async (done) => {
    const postId = selectedPost._id
    const commentId = selectedComment._id

    await deleteComment(postId, commentId)

    const { comments: updatedComments } = (await getPostByIdFixture(postId))!

    expect(updatedComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()

    done()
  })
})
