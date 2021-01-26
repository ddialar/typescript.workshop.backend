import { connect, disconnect } from '@infrastructure/orm/mongoose/core'
import { UserDto, NewUserDatabaseDto } from '@infrastructure/dtos'
// import { testingUsers, testingNonPersistedUsername, cleanUsersCollection, saveUser } from '@testingFixtures'
import { testingUsers, cleanUsersCollection, saveUser } from '@testingFixtures'

import { getByUsername } from '@infrastructure/orm/mongoose/requests/user.mongodb.requests'

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
    await cleanUsersCollection()
  })

  afterAll(async () => {
    await cleanUsersCollection()
    await disconnect()
  })

  // it('must not retrieve any user', async (done) => {
  //   const username = testingNonPersistedUsername
  //   const retrievedUser = await getByUsername(username)
  //   expect(retrievedUser).toBeNull()

  //   done()
  // })

  it('must retrieve the persisted user', async (done) => {
    const newUserData: NewUserDatabaseDto = { ...mockedUserData }
    await saveUser(newUserData)

    const username = newUserData.username
    const retrievedUser = await getByUsername(username) as UserDto

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

    done()
  })
})
