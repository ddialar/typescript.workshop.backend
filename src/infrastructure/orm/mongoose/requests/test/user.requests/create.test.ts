import { connect, disconnect } from '../../../core'
import { NewUserDatabaseDto, UserDto } from '@infrastructure/dtos'

import { testingUsers, cleanUsersCollectionFixture, getUserByUsernameFixture } from '@testingFixtures'

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
    await create(newUserData)

    const retrievedUser = await getUserByUsernameFixture(username) as UserDto

    const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const retrievedUserFields = Object.keys(retrievedUser).sort()
    expect(retrievedUserFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUser._id).not.toBeNull()
    expect(retrievedUser.username).toBe(mockedUserData.username)
    expect(retrievedUser.password).toBe(mockedUserData.password)
    expect(retrievedUser.email).toBe(mockedUserData.email)
    expect(retrievedUser.name).toBe(mockedUserData.name)
    expect(retrievedUser.surname).toBe(mockedUserData.surname)
    expect(retrievedUser.avatar).toBe(mockedUserData.avatar)
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.token).toBe('')
    expect(retrievedUser.lastLoginAt).toBe('')

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
