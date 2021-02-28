import { connect, disconnect } from '../../../core'
import { testingLikedAndCommentedPersistedDtoPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

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

    const { comments: updatedComments } = await deleteComment(postId, commentId)

    expect(updatedComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()

    done()
  })
})
