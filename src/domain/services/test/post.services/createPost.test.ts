import { lorem } from 'faker'
import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { testingDomainModelPostOwners, cleanUsersCollectionFixture } from '@testingFixtures'

import { createPost } from '@domainServices'
import { CreatingPostError } from '@errors'

describe('[SERVICES] Post - createPost', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing error'
  const [owner] = testingDomainModelPostOwners
  const postBody = lorem.paragraph()

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollectionFixture()
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  it('must create the post and return the final result', async (done) => {
    const persistedPost = await createPost(owner, postBody)

    const expectedPostFields = ['id', 'body', 'owner', 'userIsOwner', 'userHasLiked', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
    expect(Object.keys(persistedPost).sort()).toEqual(expectedPostFields)

    expect(persistedPost.body).toBe(postBody)

    const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar'].sort()
    expect(Object.keys(persistedPost.owner).sort()).toEqual(expectedPostOwnerFields)

    expect(persistedPost.owner).toStrictEqual(owner)

    expect(persistedPost.userIsOwner).toBeTruthy()
    expect(persistedPost.userHasLiked).toBeFalsy()

    expect(persistedPost.comments).toHaveLength(0)
    expect(persistedPost.likes).toHaveLength(0)

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
    jest.spyOn(postDataSource, 'createPost').mockImplementation(() => Promise.resolve(null))

    const message = 'Post creation process initiated but completed with NULL result'
    const expectedError = new CreatingPostError(`Error creating post for user '${owner.id}'. ${message}`)

    await expect(createPost(owner, postBody)).rejects.toThrowError(expectedError)

    jest.spyOn(postDataSource, 'createPost').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
    jest.spyOn(postDataSource, 'createPost').mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const expectedError = new CreatingPostError(`Error creating post for user '${owner.id}'. ${errorMessage}`)

    try {
      await createPost(owner, postBody)
    } catch (error) {
      expect(error.status).toBe(expectedError.status)
      expect(error.message).toBe(expectedError.message)
      expect(error.description).toBe(expectedError.description)
    }

    jest.spyOn(postDataSource, 'createPost').mockRestore()

    done()
  })
})
