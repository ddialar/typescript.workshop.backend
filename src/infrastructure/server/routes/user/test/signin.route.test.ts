import supertest, { SuperTest, Test } from 'supertest'
import { compare } from 'bcrypt'

import { server } from '@infrastructure/server'
import { mongodb } from '@infrastructure/orm'

import { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@errors'
import { NewUserInputDto } from '@infrastructure/dtos'
import { userDataSource } from '@infrastructure/dataSources'

import {
  testingUsers,
  testingValidPlainPassword,
  cleanUsersCollectionFixture,
  getUserByUsernameFixture,
  saveUserFixture
} from '@testingFixtures'
import { RegisteredUserDomainModel } from '@domainModels'

const [{ email, name, surname, avatar }] = testingUsers

const SIGIN_PATH = '/signin'

describe(`[POST] ${SIGIN_PATH}`, () => {
  const { connect, disconnect } = mongodb
  let request: SuperTest<Test>

  beforeAll(async () => {
    request = supertest(server)
    await connect()
  })

  beforeEach(async () => {
    await cleanUsersCollectionFixture()
  })

  afterAll(async () => {
    await cleanUsersCollectionFixture()
    await disconnect()
  })

  const mockedUserData: NewUserInputDto = {
    email,
    password: testingValidPlainPassword,
    name,
    surname,
    avatar
  }

  it('must return a CREATED (201) and a record the new user', async () => {
    const newUserData = { ...mockedUserData }
    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(CREATED)
      .then(async ({ body }) => {
        const registeredUser: RegisteredUserDomainModel = body

        const expectedRegisteredFields = ['username', 'fullName', 'avatar']
        const registeredUserFields = Object.keys(registeredUser).sort()
        expect(registeredUserFields.sort()).toEqual(expectedRegisteredFields.sort())

        expect(registeredUser.username).toBe(newUserData.email)
        expect(registeredUser.fullName).toBe(`${newUserData.name} ${newUserData.surname}`)
        expect(registeredUser.avatar).toBe(newUserData.avatar)

        const retrievedUser = (await getUserByUsernameFixture(newUserData.email))!

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
  })

  it('must return a BAD_REQUEST (400) when we try to persist an already user', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'User already exists'

    await saveUserFixture({ ...newUserData, username: newUserData.email })

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the email is not provided', async () => {
    const { email, ...newUserData } = mockedUserData
    const expectedErrorMessage = 'Signin data error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided email has not a valid structure', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.email = '@wrong.mail.com'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the password is not provided', async () => {
    const { password, ...newUserData } = mockedUserData
    const expectedErrorMessage = 'Signin data error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided password has not a valid structure', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.password = '123' // Password too short.

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided password contains not valid elements', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.password = '123$#%'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the name is not provided', async () => {
    const { name, ...newUserData } = mockedUserData
    const expectedErrorMessage = 'Signin data error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided name has not the minimum amount of characters', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.name = 'J'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the surname is not provided', async () => {
    const { surname, ...newUserData } = mockedUserData
    const expectedErrorMessage = 'Signin data error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided surname has not the minimum amount of characters', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.surname = 'J'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the avatar is not provided', async () => {
    const { avatar, ...newUserData } = mockedUserData
    const expectedErrorMessage = 'Signin data error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided avatar is an empty string', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.avatar = ''

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided avatar has a schema different to http or https', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.avatar = newUserData.avatar.replace('https', 'git')

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return a BAD_REQUEST (400) when the provided avatar has less than two domains', async () => {
    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Signin data error'

    newUserData.avatar = newUserData.avatar.replace('cdn.icon-icons.', '')

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(BAD_REQUEST)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })
  })

  it('must return an INTERNAL_SERVER_ERROR (500) when the retrieving user data process fails', async () => {
    jest.spyOn(userDataSource, 'getUserByUsername').mockImplementation(() => {
      throw new Error('Testing Error')
    })

    const newUserData = { ...mockedUserData }
    const expectedErrorMessage = 'Internal Server Error'

    await request
      .post(SIGIN_PATH)
      .send(newUserData)
      .expect(INTERNAL_SERVER_ERROR)
      .then(({ text }) => {
        expect(JSON.parse(text)).toEqual({ error: true, message: expectedErrorMessage })
      })

    jest.spyOn(userDataSource, 'getUserByUsername').mockRestore()
  })
})
