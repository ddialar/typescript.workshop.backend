import { connect, disconnect } from '../../../core'
import { User } from '../../../models'
import { UserDto, NewUserDatabaseDto } from '@infrastructure/dtos'
import { getUtcTimestampIsoString } from '@common'
import { testingUsers, cleanUsersCollection, saveUser } from '@testingFixtures'

import { updateById } from '../../user.mongodb.requests'

const [{ username, password, email, name, surname, avatar }] = testingUsers

describe('[ORM] MongoDB - updateById', () => {
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

  it('must update several allowed fields successfully', async (done) => {
    const newUserData: NewUserDatabaseDto = { ...mockedUserData }
    await saveUser(newUserData)

    const originalUser = (await User.findOne({ username: newUserData.username }))?.toJSON() as UserDto

    const expectedFields = ['_id', 'username', 'password', 'email', 'name', 'surname', 'avatar', 'token', 'enabled', 'deleted', 'lastLoginAt', 'createdAt', 'updatedAt']
    const originalUserFields = Object.keys(originalUser).sort()
    expect(originalUserFields.sort()).toEqual(expectedFields.sort())

    expect(originalUser._id).not.toBeNull()
    expect(originalUser.username).toBe(newUserData.username)
    expect(originalUser.password).toBe(newUserData.password)
    expect(originalUser.email).toBe(newUserData.email)
    expect(originalUser.name).toBe(newUserData.name)
    expect(originalUser.surname).toBe(newUserData.surname)
    expect(originalUser.avatar).toBe(newUserData.avatar)
    expect(originalUser.enabled).toBeTruthy()
    expect(originalUser.deleted).toBeFalsy()
    expect(originalUser.createdAt).not.toBeNull()
    expect(originalUser.updatedAt).not.toBeNull()

    expect(originalUser.token).toBe('')
    expect(originalUser.lastLoginAt).toBe('')

    const payload = {
      password: '$2b$04$fXK3oNgOHp5utyRacBhDXu88ZeCFIl1rqdzWfDi4K1Vq99ufoA1d.',
      name: 'Jane',
      surname: 'Doe',
      avatar: 'https://cdn.icon-icons.com/icons2/1736/PNG/512/4043247-1-avatar-female-portrait-woman_113261.png',
      token: 'newMockedToken',
      enabled: false,
      deleted: true,
      lastLoginAt: getUtcTimestampIsoString()
    }

    await updateById(originalUser._id, payload)

    const updatedUser = (await User.findOne({ username: newUserData.username }))?.toJSON() as UserDto

    const updatedUserFields = Object.keys(updatedUser).sort()
    expect(updatedUserFields.sort()).toEqual(expectedFields.sort())

    expect(updatedUser._id).toEqual(originalUser._id)
    expect(updatedUser.username).toBe(originalUser.username)
    expect(updatedUser.email).toBe(originalUser.email)
    expect(updatedUser.createdAt).toEqual(originalUser.createdAt)

    expect(updatedUser.password).toBe(payload.password)
    expect(updatedUser.token).toBe(payload.token)
    expect(updatedUser.name).toBe(payload.name)
    expect(updatedUser.surname).toBe(payload.surname)
    expect(updatedUser.avatar).toBe(payload.avatar)
    expect(updatedUser.enabled).toBeFalsy()
    expect(updatedUser.deleted).toBeTruthy()
    expect(updatedUser.updatedAt).not.toBe(originalUser.updatedAt)
    expect(updatedUser.lastLoginAt).toBe(payload.lastLoginAt)

    done()
  })
})
