import { lorem } from 'faker'
import { mongodb } from '@infrastructure/orm'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  savePostsFixture,
  cleanPostsCollectionFixture
} from '@testingFixtures'

import { createPostComment } from '@domainServices'
import { CreatingPostCommentError } from '@errors'
import { postDataSource } from '@infrastructure/dataSources'

describe('[SERVICES] Post - createPostComment', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const [selectedPostDto] = testingLikedAndCommentedPersistedDtoPosts
  const [selectedPostDomainModel] = testingLikedAndCommentedPersistedDomainModelPosts
  const { id: selectedPostDomainModelId, owner: selectedPostDomainModelOwner } = selectedPostDomainModel
  const [newPostCommentOwner] = testingDomainModelFreeUsers

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
    await savePostsFixture([selectedPostDto])
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new comment into the selected post, when the user is the post owner', async (done) => {
    const postId = selectedPostDomainModelId
    const commentBody = lorem.paragraph()
    const owner = selectedPostDomainModelOwner

    const updatedPost = await createPostComment(postId, commentBody, owner)

    const expectedPostFields = ['id', 'body', 'owner', 'userIsOwner', 'userHasLiked', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
    expect(Object.keys(updatedPost).sort()).toEqual(expectedPostFields)

    expect(updatedPost.id).toBe(selectedPostDomainModel.id)
    expect(updatedPost.body).toBe(selectedPostDomainModel.body)

    const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
    expect(Object.keys(updatedPost.owner).sort()).toEqual(expectedPostOwnerFields)
    expect(updatedPost.owner).toStrictEqual(selectedPostDomainModel.owner)

    expect(updatedPost.userIsOwner).toBeTruthy()
    expect(updatedPost.userHasLiked).toBeFalsy()

    expect(updatedPost.comments).toHaveLength(selectedPostDomainModel.comments.length + 1)
    const expectedCommentFields = ['id', 'body', 'owner', 'userIsOwner', 'createdAt', 'updatedAt'].sort()
    updatedPost.comments.forEach(comment => {
      expect(Object.keys(comment).sort()).toEqual(expectedCommentFields)
    })
    const originalCommentsIds = selectedPostDomainModel.comments.map(({ id }) => id.toString())
    const newPersistedComment = updatedPost.comments.find(({ id }) => !originalCommentsIds.includes(id!))

    expect(newPersistedComment?.body).toBe(commentBody)
    expect(newPersistedComment?.owner).toStrictEqual(owner)
    expect(newPersistedComment?.userIsOwner).toBeTruthy()

    expect(updatedPost.likes).toStrictEqual(selectedPostDomainModel.likes)

    expect(updatedPost.createdAt).toBe(selectedPostDomainModel.createdAt)
    expect(updatedPost.updatedAt).not.toBe(selectedPostDomainModel.updatedAt)

    done()
  })

  it('must persist the new comment into the selected post, when the user is not the post owner', async (done) => {
    const postId = selectedPostDomainModelId
    const commentBody = lorem.paragraph()
    const owner = newPostCommentOwner

    const updatedPost = await createPostComment(postId, commentBody, owner)

    const expectedPostFields = ['id', 'body', 'owner', 'userIsOwner', 'userHasLiked', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
    expect(Object.keys(updatedPost).sort()).toEqual(expectedPostFields)

    expect(updatedPost.id).toBe(selectedPostDomainModel.id)
    expect(updatedPost.body).toBe(selectedPostDomainModel.body)

    const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
    expect(Object.keys(updatedPost.owner).sort()).toEqual(expectedPostOwnerFields)
    expect(updatedPost.owner).toStrictEqual(selectedPostDomainModel.owner)

    expect(updatedPost.userIsOwner).toBeFalsy()
    expect(updatedPost.userHasLiked).toBeFalsy()

    expect(updatedPost.comments).toHaveLength(selectedPostDomainModel.comments.length + 1)
    const expectedCommentFields = ['id', 'body', 'owner', 'userIsOwner', 'createdAt', 'updatedAt'].sort()
    updatedPost.comments.forEach(comment => {
      expect(Object.keys(comment).sort()).toEqual(expectedCommentFields)
    })
    const originalCommentsIds = selectedPostDomainModel.comments.map(({ id }) => id.toString())
    const newPersistedComment = updatedPost.comments.find(({ id }) => !originalCommentsIds.includes(id!))

    expect(newPersistedComment?.body).toBe(commentBody)
    expect(newPersistedComment?.owner).toStrictEqual(owner)
    expect(newPersistedComment?.userIsOwner).toBeTruthy()

    expect(updatedPost.likes).toStrictEqual(selectedPostDomainModel.likes)

    expect(updatedPost.createdAt).toBe(selectedPostDomainModel.createdAt)
    expect(updatedPost.updatedAt).not.toBe(selectedPostDomainModel.updatedAt)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
    jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => Promise.resolve(null))

    const postId = selectedPostDomainModelId
    const newPostComment = lorem.paragraph()
    const message = 'Post comment insertion process initiated but completed with NULL result'
    const expectedError = new CreatingPostCommentError(`Error creating post '${postId}' commment by user '${newPostCommentOwner.id}'. ${message}`)

    await expect(createPostComment(postId, newPostComment, newPostCommentOwner)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'createPostComment').mockRestore()

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
    jest.spyOn(postDataSource, 'createPostComment').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPostDomainModelId
    const newPostComment = lorem.paragraph()
    const expectedError = new CreatingPostCommentError(`Error creating post '${postId}' commment by user '${newPostCommentOwner.id}'. ${errorMessage}`)

    try {
      await createPostComment(postId, newPostComment, newPostCommentOwner)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'createPostComment').mockRestore()

    done()
  })
})
