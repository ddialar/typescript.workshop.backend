import { mongodb } from '@infrastructure/orm'
import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { userDataSource } from '@infrastructure/dataSources'
import { UpdatingUserError } from '@errors'
import { testingUsers, cleanUsersCollection, saveUser, getUserByUsername } from '@testingFixtures'

import { updateUserLoginData } from '@domainServices'

describe('[SERVICES] User - updateUserLoginData', () => {
  const { connect, disconnect } = mongodb
  const errorMessage = 'Testing Error'
  const [{ username, password, email, name, surname, avatar, token }] = testingUsers
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

    const originalUser = await getUserByUsername(newUserData.username)

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

    const userId = originalUser._id

    await updateUserLoginData(userId, token)

    const updatedUser = await getUserByUsername(newUserData.username)

    const updatedUserFields = Object.keys(updatedUser).sort()
    expect(updatedUserFields.sort()).toEqual(expectedFields.sort())

    expect(updatedUser.token).toBe(token)
    expect(updatedUser.lastLoginAt).not.toBe(originalUser.lastLoginAt)

    expect(updatedUser._id).toEqual(originalUser._id)
    expect(updatedUser.username).toBe(originalUser.username)
    expect(updatedUser.email).toBe(originalUser.email)
    expect(updatedUser.createdAt).toEqual(originalUser.createdAt)

    expect(updatedUser.password).toBe(originalUser.password)
    expect(updatedUser.name).toBe(originalUser.name)
    expect(updatedUser.surname).toBe(originalUser.surname)
    expect(updatedUser.avatar).toBe(originalUser.avatar)
    expect(updatedUser.enabled).toBeTruthy()
    expect(updatedUser.deleted).toBeFalsy()
    expect(updatedUser.updatedAt).not.toBe(originalUser.updatedAt)

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new UpdatingUserError(errorMessage)
    })

    const newUserData: NewUserDatabaseDto = { ...mockedUserData }
    await saveUser(newUserData)

    const { _id: userId } = await getUserByUsername(username)
    const expectedError = new UpdatingUserError(`Error updating user '${userId}' login data. ${errorMessage}`)

    await expect(updateUserLoginData(userId, token)).rejects.toThrowError(expectedError)

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
