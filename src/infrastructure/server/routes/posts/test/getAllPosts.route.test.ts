import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, INTERNAL_SERVER_ERROR } from '@errors'
import { PostDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'

import { testingLikedAndCommentedPersistedDtoPosts, testingLikedAndCommentedPersistedDomainModelPosts, savePostsFixture, cleanPostsCollectionFixture } from '@testingFixtures'

const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts

const POSTS_PATH = '/posts'

describe('[API] - Posts endpoints', () => {
  describe(`[GET] ${POSTS_PATH}`, () => {
    const { connect, disconnect } = mongodb

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
      await savePostsFixture(mockedPosts)
    })

    afterAll(async () => {
      await cleanPostsCollectionFixture()
      await disconnect()
    })

    it('returns OK (200) and an empty array in the body when no posts have been found', async () => {
      jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => Promise.resolve([]))

      await request
        .get(POSTS_PATH)
        .expect(OK)
        .then(({ body }) => {
          expect(body).toStrictEqual([])
        })

      jest.spyOn(postDataSource, 'getPosts').mockRestore()
    })

    it('returns OK (200) and the whole persisted post', async () => {
      await request
        .get(POSTS_PATH)
        .expect(OK)
        .then(async ({ body }) => {
          const persistedPosts: PostDomainModel[] = body

          expect(persistedPosts).toHaveLength(persistedPosts.length)

          persistedPosts.forEach((post) => {
            const expectedFields = ['id', 'body', 'owner', 'comments', 'likes', 'createdAt', 'updatedAt'].sort()
            expect(Object.keys(post).sort()).toEqual(expectedFields)

            const expectedPost = resultPosts.find((resultPost) => resultPost.id === post.id?.toString())

            expect(post).toStrictEqual<PostDomainModel>(expectedPost!)
          })
        })
    })

    it('returns INTERNAL_SERVER_ERROR (500) when the persistance throws an exception', async () => {
      jest.spyOn(postDataSource, 'getPosts').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const expectedErrorMessage = 'Internal Server Error'

      await request
        .get(POSTS_PATH)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPosts').mockRestore()
    })
  })
})
