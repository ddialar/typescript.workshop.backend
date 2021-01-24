import supertest, { SuperTest, Test } from 'supertest'
import { compare } from 'bcrypt'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@errors'
import { NewUserInputDto } from '@infrastructure/dtos'
import { userDataSource } from '@infrastructure/dataSources'

import { testingUsers, cleanUsersCollection, getUserByUsername, saveUser } from '@testingFixtures'

const { email, password, name, surname, avatar } = testingUsers[0]

const SIGIN_PATH = '/signin'

describe(`[POST] ${SIGIN_PATH}`, () => {
  const { connect, disconnect } = mongodb
  let request: SuperTest<Test>

  beforeAll(async () => {
    request = supertest(server)
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollection()
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  const mockedUserData: NewUserInputDto = {
    email,
    password,
    name,
    surname,
    avatar
  }

  it('must return a 201 (CREATED) and a record the new user', async (done) => {
    const newUserData = { ...mockedUserData }
    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(CREATED)
      .then(async ({ text }) => {
        expect(text).toBe('User created')

        const retrievedUser = await getUserByUsername(newUserData.email)

        const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
        const retrievedUserFields = Object.keys(retrievedUser).sort()
        expect(retrievedUserFields.sort()).toEqual(expectedFields.sort())

        expect(retrievedUser._id).not.toBeNull()
        expect(retrievedUser.username).toBe(newUserData.email)
        expect(retrievedUser.password).toMatch(/^\$[$/.\w\d]{59}$/)
        expect((await compare(newUserData.password, retrievedUser.password))).toBeTruthy()
        expect(retrievedUser.email).toBe(newUserData.email)
        expect(retrievedUser.name).toBe(newUserData.name)
        expect(retrievedUser.surname).toBe(newUserData.surname)
        expect(retrievedUser.avatar).toBe(newUserData.avatar)
        expect(retrievedUser.enabled).toBeTruthy()
        expect(retrievedUser.deleted).toBeFalsy()
        expect(retrievedUser.createdAt).not.toBeNull()
        expect(retrievedUser.updatedAt).not.toBeNull()

        expect(retrievedUser.token).toBe('')
        expect(retrievedUser.lastLoginAt).toBe('')
      })

    done()
  })

  it('must return a 400 (BAD_REQUEST) when we try to persist an already user', async (done) => {
    const newUserData = { ...mockedUserData }
    const errorMessage = 'User already exists'

    await saveUser({ ...newUserData, username: newUserData.email })

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
      })

    done()
  })

  it('must return an INTERNAL_SERVER_ERROR (500) when the updating logout user data process fails', async (done) => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new Error('Testing Error')
    })

    const newUserData = { ...mockedUserData }
    const errorMessage = 'Internal Server Error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(INTERNAL_SERVER_ERROR)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: errorMessage })
      })

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()

    done()
  })
})
