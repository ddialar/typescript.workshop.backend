import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel } from '@domainModels'
import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  savePosts,
  cleanPostsCollection
} from '@testingFixtures'

import { getPostById } from '@domainServices'
import { GettingPostError, PostNotFoundError } from '@errors'

describe('[SERVICES] Post - getPostById', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
  const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts
  const [selectedPost] = resultPosts
  const { id: selectedPostId } = selectedPost
  const nonValidPostId = selectedPost.comments[0].id

  beforeAll(async () => {
    await connect()
    await savePosts(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollection()
    await disconnect()
  })

  it('must retrieve the whole persisted posts', async (done) => {
    const postId = selectedPostId

    const persistedPost = await getPostById(postId)

    expect(persistedPost).toStrictEqual<PostDomainModel>(selectedPost)

    done()
  })

  it('must throw an NOT_FOUND (404) when the selected post does not exist', async (done) => {
    const postId = nonValidPostId
    const expectedError = new PostNotFoundError(`Post with id '${postId}' doesn't exist.`)

    await expect(getPostById(postId)).rejects.toThrowError(expectedError)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const postId = selectedPostId
    const expectedError = new GettingPostError(`Error retereaving post '${postId}'. ${errorMessage}`)

    await expect(getPostById(postId)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPostById').mockRestore()

    done()
  })
})
