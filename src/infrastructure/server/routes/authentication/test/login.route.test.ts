import { verify, Secret } from 'jsonwebtoken'
import supertest, { SuperTest, Test } from 'supertest'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { LoginInputParams, DecodedJwtToken } from '@infrastructure/types'

import { cleanUsersCollection, saveUser, testingUsers, testingValidPlainPassword } from '@testingFixtures'

const [{ id: userId, username: testingUsername, password, email, name, surname, avatar }] = testingUsers

const secret: Secret = process.env.JWT_KEY!
const LOGIN_PATH = '/login'

describe('[API] - Authentication endpoints', () => {
  describe(`[POST] ${LOGIN_PATH}`, () => {
    const { connect, disconnect } = mongodb

    const mockedUserData: NewUserDatabaseDto & { _id: string } = {
      _id: userId,
      username: testingUsername,
      password,
      email,
      name,
      surname,
      avatar
    }

    let request: SuperTest<Test>

    beforeAll(async () => {
      request = supertest(server)
      await connect()
    })

    beforeEach(async () => {
      await cleanUsersCollection()
      await saveUser(mockedUserData)
    })

    afterAll(async () => {
      await cleanUsersCollection()
      await disconnect()
    })

    it('must return a 200 (OK) and the user authentication data', async (done) => {
      const loginData: LoginInputParams = {
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

          const verifiedToken = verify(body.token as string, secret) as DecodedJwtToken
          const expectedTokenFields = ['exp', 'iat', 'sub', 'username']
          const retrievedTokenFields = Object.keys(verifiedToken).sort()
          expect(retrievedTokenFields.sort()).toEqual(expectedTokenFields.sort())

          expect(verifiedToken.exp).toBeGreaterThan(0)
          expect(verifiedToken.iat).toBeGreaterThan(0)
          expect(verifiedToken.sub).toBe(userId) // Implement the ORM in order to access this information.
          expect(verifiedToken.username).toBe(loginData.username)
        })

      done()
    })
  })
})
