import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel, UserDomainModel } from '@domainModels'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  testingDomainModelFreeUsers,
  cleanPostsCollection,
  savePosts,
  getPostById
} from '@testingFixtures'

import { deletePost } from '@domainServices'
import { DeletingPostError, GettingPostError, PostNotFoundError, UnauthorizedPostDeletingError } from '@errors'
import { PostDto } from '@infrastructure/dtos'

describe('[SERVICES] Post - deletePost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts as PostDto[]
  const [selectedPost] = testingLikedAndCommentedPersistedDomainModelPosts as PostDomainModel[]
  const mockedNonValidPostId = selectedPost.owner.id as string
  const selectedPostOwner = selectedPost.owner.id as string
  const [{ id: unauthorizedUserId }] = testingDomainModelFreeUsers as UserDomainModel[]

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollection()
    await savePosts(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must delete the selected post', async (done) => {
    const postId = selectedPost.id as string
    const postOwnerId = selectedPostOwner

    await deletePost(postId, postOwnerId)

    const retrievedPost = await getPostById(postId)

    expect(retrievedPost).toBeNull()

    done()
  })

  it('must throw NOT_FOUND (404) when we select a post which does not exist', async (done) => {
    const postId = mockedNonValidPostId
    const postOwnerId = selectedPostOwner
    const expectedError = new PostNotFoundError(`Post with id '${postId}' was not found to be deleted by user with id '${postOwnerId}'.`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw UNAUTHORIZED (401) when the action is performed by an user who is not the owner of the post', async (done) => {
    const postId = selectedPost.id as string
    const postOwnerId = unauthorizedUserId
    const expectedError = new UnauthorizedPostDeletingError(`User '${postOwnerId}' is not the owner of the post '${postId}', which is trying to delete.`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error retrieving the post', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const postOwnerId = selectedPostOwner
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePost').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the deleting process throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'deletePost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPost.id as string
    const postOwnerId = selectedPostOwner
    const expectedError = new DeletingPostError(`Error deleting '${postId}' by user '${postOwnerId}'. ${errorMessage}`)

    await expect(deletePost(postId, postOwnerId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'deletePost').mockRestore()

    done()
  })
})
