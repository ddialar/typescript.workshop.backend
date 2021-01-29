import { lorem } from 'faker'
import { connect, disconnect } from '../../../core'
import { PostCommentDto, PostDto } from '@infrastructure/dtos'
import { testingLikedAndCommentedPersistedDtoPosts, testingDtoFreeUsers, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { createComment } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - createComment', () => {
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]

  beforeAll(async () => {
    await connect()
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new comment into the selected post', async (done) => {
    const originalPost = mockedPosts[0] as PostDto
    const { _id: postId } = originalPost
    const postComment: PostCommentDto = {
      body: lorem.paragraph(),
      owner: testingDtoFreeUsers[0]
    }
    const updatedPost = await createComment(postId as string, postComment) as PostDto

    const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const updatedPostFields = Object.keys(updatedPost).sort()
    expect(updatedPostFields.sort()).toEqual(expectedFields.sort())

    expect(updatedPost._id).not.toBeNull()
    expect(updatedPost.body).toBe(originalPost.body)

    const expectedPostOwnerFields = ['_id', 'userId', 'name', 'surname', 'avatar', 'createdAt', 'updatedAt']
    const createCommentdOwnerPostFields = Object.keys(updatedPost.owner).sort()
    expect(createCommentdOwnerPostFields.sort()).toEqual(expectedPostOwnerFields.sort())
    expect(updatedPost.owner).toStrictEqual(originalPost.owner)

    expect(updatedPost.comments).toHaveLength(originalPost.comments.length + 1)
    const originalCommentsIds = originalPost.comments.map(({ _id }) => _id as string)
    const updatedCommentsIds = updatedPost.comments.map(({ _id }) => _id as string)
    const newPostId = updatedCommentsIds.find((updatedId) => !originalCommentsIds.includes(updatedId))
    const newPersistedComment = updatedPost.comments.find((comment) => comment._id === newPostId) as PostDto
    expect(newPersistedComment.body).toBe(postComment.body)
    const { _id, createdAt, updatedAt, ...otherCommentOwnerFields } = newPersistedComment.owner
    expect(otherCommentOwnerFields).toStrictEqual(postComment.owner)

    expect(updatedPost.likes).toStrictEqual(originalPost.likes)

    expect(updatedPost.createdAt).toBe(originalPost.createdAt)
    expect(updatedPost.updatedAt).not.toBe(originalPost.updatedAt)

    done()
  })
})
