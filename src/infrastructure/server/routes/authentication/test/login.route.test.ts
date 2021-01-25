import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'

import { testingUsers, testingValidPlainPassword } from '../../../../../test/fixtures'

const [{ username: testingUsername }] = testingUsers

const LOGIN_PATH = '/login'

describe('[API] - Authentication endpoints', () => {
  describe(`[POST] ${LOGIN_PATH}`, () => {
    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
    })

    it('must return a 200 (OK) and the user authentication data', async (done) => {
      // TODO Type the login data with the LoginInputParams interface
      const loginData = {
        username: testingUsername,
        password: testingValidPlainPassword
      }
      await request
        .post(LOGIN_PATH)
        .send(loginData)
        .expect(200)
        .then(async ({ body }) => {
          const expectedFields = ['token']
          const retrievedAuthenticationDataFields = Object.keys(body).sort()
          expect(retrievedAuthenticationDataFields.sort()).toEqual(expectedFields.sort())

          expect(body.token).not.toBe('')

          expect(body.token).toBe(`This is your token for '${loginData.username}' and '${loginData.password}'.`)
        })

      done()
    })
  })
})
