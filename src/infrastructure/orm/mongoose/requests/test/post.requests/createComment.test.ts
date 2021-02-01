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

  it.only('must persist the new comment into the selected post', async (done) => {
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
    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(updatedPost.owner))).toStrictEqual(originalPost.owner)

    expect(updatedPost.comments).toHaveLength(originalPost.comments.length + 1)
    const originalCommentsIds = originalPost.comments.map(({ _id }) => _id?.toString())
    const updatedCommentsIds = updatedPost.comments.map(({ _id }) => _id?.toString())
    const newPostId = updatedCommentsIds.find((updatedId) => !originalCommentsIds.includes(updatedId))!
    const newPersistedComment = updatedPost.comments.find((comment) => comment._id?.toString() === newPostId) as PostCommentDto

    expect(newPersistedComment.body).toBe(postComment.body)
    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(newPersistedComment.owner))).toStrictEqual(postComment.owner)
    expect(JSON.parse(JSON.stringify(updatedPost.likes))).toStrictEqual(originalPost.likes)

    expect((new Date(updatedPost.createdAt!)).toISOString()).toBe(originalPost.createdAt)
    expect((new Date(updatedPost.updatedAt!)).toISOString()).not.toBe(originalPost.updatedAt)

    done()
  })
})
