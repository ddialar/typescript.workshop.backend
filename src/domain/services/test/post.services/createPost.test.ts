import { lorem } from 'faker'
import { mongodb } from '@infrastructure/orm'
import { postDataSource } from '@infrastructure/dataSources'
import { testingDomainModelPostOwners, cleanUsersCollection } from '@testingFixtures'

import { createPost } from '@domainServices'
import { CreatingPostError } from '@errors'

describe('[SERVICES] Post - createPost', () => {
  const { connect, disconnect } = mongodb

  const owner = testingDomainModelPostOwners[0]
  const postBody = lorem.paragraph()

  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollection()
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  it('must create the post and return the final result', async (done) => {
    const persistedPost = await createPost(owner, postBody)

    const expectedPostFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const createdPostFields = Object.keys(persistedPost).sort()
    expect(createdPostFields.sort()).toEqual(expectedPostFields.sort())

    expect(persistedPost.body).toBe(postBody)

    const expectedPostOwnerFields = ['id', 'name', 'surname', 'avatar']
    const createdPostOwnerFields = Object.keys(persistedPost.owner).sort()
    expect(createdPostOwnerFields.sort()).toEqual(expectedPostOwnerFields.sort())

    expect(persistedPost.owner).toStrictEqual(owner)

    expect(persistedPost.comments).toHaveLength(0)
    expect(persistedPost.likes).toHaveLength(0)

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the persistance process returns a NULL value', async (done) => {
    jest.spyOn(postDataSource, 'createPost').mockImplementation(() => Promise.resolve(null))

    try {
      await createPost(owner, postBody)
    } catch (error) {
      const message = 'Post creation process initiated but completed with NULL result'
      expect(error).toStrictEqual(new CreatingPostError(`Error creating post for user '${owner.id}'. ${message}`))
    }

    jest.spyOn(postDataSource, 'createPost').mockRestore()

    done()
  })

  it('must throw INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async (done) => {
    jest.spyOn(postDataSource, 'createPost').mockImplementation(() => {
      throw new Error('Testing error')
    })

    try {
      await createPost(owner, postBody)
    } catch (error) {
      expect(error).toStrictEqual(new CreatingPostError(`Error creating post for user '${owner.id}'. ${error.message}`))
    }

    jest.spyOn(postDataSource, 'createPost').mockRestore()

    done()
  })
})
