import { lorem } from 'faker'
import { connect, disconnect } from '../../../core'
import { PostOwnerDto } from '@infrastructure/dtos'
import { testingDtoPostOwners, cleanPostsCollectionFixture } from '@testingFixtures'

import { create } from '../../post.mongodb.requests'

describe('[ORM] MongoDB - Posts - create', () => {
  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    await cleanPostsCollectionFixture()
  })

  afterAll(async () => {
    await cleanPostsCollectionFixture()
    await disconnect()
  })

  it('must persist the new user successfully', async () => {
    const body = lorem.paragraph()
    const [owner] = testingDtoPostOwners
    const basicPost = { body, owner, comments: [], likes: [] }

    const createdPost = (await create(basicPost))!

    const expectedFields = ['_id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt']
    const createdPostFields = Object.keys(createdPost).sort()
    expect(createdPostFields.sort()).toEqual(expectedFields.sort())

    expect(createdPost._id).not.toBeNull()
    expect(createdPost.body).toBe(basicPost.body)

    const expectedPostOwnerFields = ['_id', 'userId', 'name', 'surname', 'avatar', 'createdAt', 'updatedAt']
    const createdOwnerPostFields = Object.keys(createdPost.owner).sort()
    expect(createdOwnerPostFields.sort()).toEqual(expectedPostOwnerFields.sort())

    // NOTE The fiels 'createdAt' and 'updatedAt' are retrived as 'object' from the database and not as 'string'.
    expect(JSON.parse(JSON.stringify(createdPost.owner))).toStrictEqual<PostOwnerDto>(basicPost.owner)

    expect(createdPost.comments).toStrictEqual(basicPost.comments)
    expect(createdPost.likes).toStrictEqual(basicPost.likes)
    expect(createdPost.createdAt).not.toBeNull()
    expect(createdPost.updatedAt).not.toBeNull()
  })
})
