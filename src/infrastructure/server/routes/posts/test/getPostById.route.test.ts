import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from '@errors'
import { PostDomainModel } from '@domainModels'
import { postDataSource } from '@infrastructure/dataSources'

import {
  testingLikedAndCommentedPersistedDtoPosts,
  testingLikedAndCommentedPersistedDomainModelPosts,
  savePostsFixture,
  cleanPostsCollectionFixture
} from '@testingFixtures'

const mockedPosts = testingLikedAndCommentedPersistedDtoPosts
const resultPosts = testingLikedAndCommentedPersistedDomainModelPosts
const [selectedPost] = resultPosts
const nonValidPostId = selectedPost.owner.id

const POSTS_PATH = '/posts'

describe('[API] - Posts endpoints', () => {
  describe(`[GET] ${POSTS_PATH}/:id`, () => {
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

    it('must return OK (200) and the selected post data', async (done) => {
      const postId = selectedPost.id

      await request
        .get(`${POSTS_PATH}/${postId}`)
        .expect(OK)
        .then(async ({ body: persistedPost }) => {
          expect(persistedPost).not.toBeNull()
          expect(persistedPost).toStrictEqual<PostDomainModel>(selectedPost)
        })

      done()
    })

    it('must return NOT_FOUND (404) when the selected post does not exist', async (done) => {
      const postId = nonValidPostId
      const expectedErrorMessage = 'Post not found'

      await request
        .get(`${POSTS_PATH}/${postId}`)
        .expect(NOT_FOUND)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      done()
    })

    it('must return INTERNAL_SERVER_ERROR (500) when the retrieving process throws an exception', async (done) => {
      jest.spyOn(postDataSource, 'getPostById').mockImplementation(() => {
        throw new Error('Testing error')
      })

      const postId = selectedPost.id
      const expectedErrorMessage = 'Internal Server Error'

      await request
        .get(`${POSTS_PATH}/${postId}`)
        .expect(INTERNAL_SERVER_ERROR)
        .then(({ text }) => {
          expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
        })

      jest.spyOn(postDataSource, 'getPostById').mockRestore()

      done()
    })
  })
})
