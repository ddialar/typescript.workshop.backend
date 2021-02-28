import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

import { getPosts } from '@domainServices'
import { GettingPostError } from '@errors'

const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts

describe('[SERVICES] Post - getPosts', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'

  beforeAll(async () => {
    await connect()
  })

  afterEach(async () => {
    await cleanPostsCollectionFixture()
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve an empty array when there are no posts', async (done) => {
    await expect(getPosts()).resolves.toHaveLength(0)

    done()
  })

  it('must retrieve the whole persisted posts', async (done) => {
    await savePostsFixture(mockedPosts)

    const persistedPosts = await getPosts()

    expect(persistedPosts).toHaveLength(mockedPosts.length)

    persistedPosts.forEach((post) => {
      const expectedFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
      expect(Object.keys(post).sort()).toEqual(expectedFields)

      const expectedPost = resultPosts.find((resultPost) => resultPost.id === post.id?.toString())

      expect(post).toStrictEqual(expectedPost)
    })

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const expectedError = new GettingPostError(`Error retereaving posts. ${errorMessage}`)

    try {
      await getPosts()
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'getPosts').mockRestore()

    done()
  })
})
