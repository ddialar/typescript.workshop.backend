import { connect, disconnect } from '../../../core'
import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { testingUsers, testingNonPersistedUsername, cleanUsersCollectionFixture, saveUserFixture } from '@testingFixtures'

import { getByUsername } from '../../user.mongodb.requests'

const [{ username, password, email, name, surname, avatar }] = testingUsers

describe('[ORM] MongoDB - getByUsername', () => {
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

  it('must not retrieve any user', async () => {
    const username = testingNonPersistedUsername
    const retrievedUser = await getByUsername(username)
    expect(retrievedUser).toBeNull()
  })

  it('must retrieve the persisted user', async () => {
    const newUserData: NewUserDatabaseDto = { ...mockedUserData }
    await saveUserFixture(newUserData)

    const username = newUserData.username
    const retrievedUser = (await getByUsername(username))!

    const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const retrievedUserFields = Object.keys(retrievedUser).sort()
    expect(retrievedUserFields.sort()).toEqual(expectedFields.sort())

    expect(retrievedUser._id).not.toBeNull()
    expect(retrievedUser.username).toBe(newUserData.username)
    expect(retrievedUser.password).toBe(newUserData.password)
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
