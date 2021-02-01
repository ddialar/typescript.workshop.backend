import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { PostDomainModel } from '@domainModels'
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
    await savePostsFixture(mockedPosts)
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must retrieve the whole persisted posts', async (done) => {
    const persistedPosts = await getPosts() as PostDomainModel[]

    expect(persistedPosts).toHaveLength(persistedPosts.length)

    persistedPosts.forEach((post) => {
      const expectedFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
      const getAlldPostFields = Object.keys(post).sort()
      expect(getAlldPostFields.sort()).toEqual(expectedFields.sort())

      const expectedPost = resultPosts.find((resultPost) => resultPost.id === post.id?.toString()) as PostDomainModel

      expect(post).toStrictEqual(expectedPost)
    })

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const expectedError = new GettingPostError(`Error retereaving posts. ${errorMessage}`)

    await expect(getPosts()).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'getPosts').mockRestore()

    done()
  })
})
