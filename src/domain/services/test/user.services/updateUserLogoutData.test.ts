import { mongodb } from '@infrastructure/orm'
import { UserDto } from '@infrastructure/dtos'
import { userDataSource } from '@infrastructure/dataSources'
import { UpdatingUserError } from '@errors'
import { testingUsers, cleanUsersCollection, saveUser, getUserByUsername } from '@testingFixtures'

import { updateUserLogoutData } from '@domainServices'

const { username, password, email, token } = testingUsers[0]

describe('[SERVICES] User - updateUserLogoutData', () => {
  const { connect, disconnect, models: { User } } = mongodb

  const mockedUserData = {
    username,
    password,
    email,
    token
  }

  beforeAll(async () => {
    await connect()
    await cleanUsersCollection()
  })

  beforeEach(async () => {
    await cleanUsersCollection()
    await saveUser(mockedUserData)
  })

  afterAll(async () => {
    await disconnect()
  })

  it('must update the user record setting the token field content to NULL', async (done) => {
    const { _id: userId, token } = (await User.findOne({ username }))?.toJSON() as UserDto

    expect(token).toBe(mockedUserData.token)

    await updateUserLogoutData(userId)

    const updatedUser = await getUserByUsername(username)

    expect(updatedUser.token).toBe('')

    done()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the datasource throws an unexpected error', async (done) => {
    jest.spyOn(userDataSource, 'updateUserById').mockImplementation(() => {
      throw new UpdatingUserError('Testing error')
    })

    const { _id: userId } = await getUserByUsername(username)

    try {
      await updateUserLogoutData(userId)
    } catch (error) {
      expect(error).toStrictEqual(new UpdatingUserError(`Error updating user '${userId}' logout data. ${error.message}`))
    }

    jest.spyOn(userDataSource, 'updateUserById').mockRestore()

    done()
  })
})
