import { connect, disconnect } from '../../../core'
import { NewUserDatabaseDto } from '@infrastructure/dtos'

import { testingUsers, cleanUsersCollectionFixture } from '@testingFixtures'

import { create } from '../../user.mongodb.requests'

const [{ username, password, email, name, surname, avatar }] = testingUsers

describe('[ORM] MongoDB - create', () => {
  const mockedUserData: NewUserDatabaseDto = {
    username,
    password,
    email,
    name,
    surname,
    avatar
  }

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

  it('must persist the new user successfully', async (done) => {
    const newUserData = { ...mockedUserData }
    const registeredUser = await create(newUserData)

    const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const registeredUserFields = Object.keys(registeredUser).sort()
    expect(registeredUserFields.sort()).toEqual(expectedFields.sort())

    expect(registeredUser._id).not.toBeNull()
    expect(registeredUser.username).toBe(mockedUserData.username)
    expect(registeredUser.password).toBe(mockedUserData.password)
    expect(registeredUser.email).toBe(mockedUserData.email)
    expect(registeredUser.name).toBe(mockedUserData.name)
    expect(registeredUser.surname).toBe(mockedUserData.surname)
    expect(registeredUser.avatar).toBe(mockedUserData.avatar)
    expect(registeredUser.enabled).toBeTruthy()
    expect(registeredUser.deleted).toBeFalsy()
    expect(registeredUser.createdAt).not.toBeNull()
    expect(registeredUser.updatedAt).not.toBeNull()

    expect(registeredUser.token).toBe('')
    expect(registeredUser.lastLoginAt).toBe('')

    done()
  })

  it('must throw an error when we try to persist the same username', async (done) => {
    const newUserData = { ...mockedUserData }
    await create(newUserData)

    // NOTE Information obtained when this error happens.
    // MongoError: E11000 duplicate key error collection: ts-course-test.users index: username_1 dup key: { username: "test@mail.com" }
    await expect(create(newUserData)).rejects.toThrow(/duplicate key error/)

    done()
  })
})
