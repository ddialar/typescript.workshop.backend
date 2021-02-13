import { connect, disconnect } from '../../../core'
import { testingUsers, testingValidJwtTokenForNonPersistedUser, cleanUsersCollectionFixture, saveUserFixture } from '@testingFixtures'

import { getByToken } from '../../user.mongodb.requests'

const [{ username, password, email, name, surname, avatar, token }] = testingUsers

describe('[ORM] MongoDB - getByToken', () => {
  const mockedUserData = {
    username,
    password,
    email,
    name,
    surname,
    avatar,
    token
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

  it('must not retrieve any user', async (done) => {
    const token = testingValidJwtTokenForNonPersistedUser
    const retrievedUser = await getByToken(token)
    expect(retrievedUser).toBeNull()

    done()
  })

  it('must retrieve the persisted user', async (done) => {
    const newUserData = { ...mockedUserData }
    await saveUserFixture(newUserData)

    const token = newUserData.token
    const retrievedUser = (await getByToken(token))!

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
    expect(retrievedUser.token).toBe(newUserData.token)
    expect(retrievedUser.enabled).toBeTruthy()
    expect(retrievedUser.deleted).toBeFalsy()
    expect(retrievedUser.createdAt).not.toBeNull()
    expect(retrievedUser.updatedAt).not.toBeNull()

    expect(retrievedUser.lastLoginAt).toBe('')

    done()
  })
})
