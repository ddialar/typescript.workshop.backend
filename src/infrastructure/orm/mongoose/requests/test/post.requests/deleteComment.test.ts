import { connect, disconnect } from '../../../core'
import { PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, savePosts, cleanPostsCollection, getPostById } from '@testingFixtures'

import { deleteComment } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - deleteComment', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const selectedPost = mockedPosts[0]
  const selectedComment = selectedPost.comments[0]

  beforeAll(async () => {
    await connect()
    await savePosts(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must delete the selected post comment', async (done) => {
    const postId = selectedPost._id as string
    const commentId = selectedComment._id as string

    await deleteComment(postId, commentId)

    const { comments: updatedComments } = await getPostById(postId) as PostDto

    expect(updatedComments).toHaveLength(selectedPost.comments.length - 1)
    expect(updatedComments.map(({ _id }) => _id).includes(commentId)).toBeFalsy()

    done()
  })
})
