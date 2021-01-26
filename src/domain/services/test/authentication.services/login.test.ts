import { verify, Secret } from 'jsonwebtoken'
import { cleanUsersCollection, getUserByUsername, saveUser, testingUsers, testingValidPlainPassword } from '@testingFixtures'

import { login } from '@domainServices'
import { NewUserDatabaseDto } from '@infrastructure/dtos'
import { DecodedJwtToken } from '@infrastructure/types'
import { mongodb } from '@infrastructure/orm'
import { WrongUsernameError } from '@errors'

const secret: Secret = process.env.JWT_KEY!

const [{ id: userId, username, password, email, name, surname, avatar }] = testingUsers

describe('[SERVICES] Authentication - login', () => {
  const { connect, disconnect } = mongodb
  const mockedUserData: NewUserDatabaseDto & { _id: string } = {
    _id: userId,
    username,
    password,
    email,
    name,
    surname,
    avatar
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

  it('must authenticate the user and return a valid identification object', async (done) => {
    const [{ username }] = testingUsers
    const password = testingValidPlainPassword

    const unauthenticatedUser = await getUserByUsername(username)

    expect(unauthenticatedUser.name).toBe(mockedUserData.name)
    expect(unauthenticatedUser.surname).toBe(mockedUserData.surname)
    expect(unauthenticatedUser.avatar).toBe(mockedUserData.avatar)

    expect(unauthenticatedUser.token).toBe('')
    expect(unauthenticatedUser.lastLoginAt).toBe('')

    const authenticationData = await login(username, password)

    expect(authenticationData.token).not.toBe('')

    const verifiedToken = verify(authenticationData.token as string, secret) as DecodedJwtToken
    const expectedFields = ['exp', 'iat', 'sub', 'username']
    const retrievedTokenFields = Object.keys(verifiedToken).sort()
    expect(retrievedTokenFields.sort()).toEqual(expectedFields.sort())

    expect(verifiedToken.exp).toBeGreaterThan(0)
    expect(verifiedToken.iat).toBeGreaterThan(0)
    expect(verifiedToken.sub).toBe(userId)
    expect(verifiedToken.username).toBe(username)

    done()
  })

  it('must throw an UNAUTHORIZED (401) error when we use a non persisted username', async (done) => {
    const username = 'user@test.com'
    const password = testingValidPlainPassword

    await expect(login(username, password)).rejects.toThrowError(new WrongUsernameError(`User with username '${username}' doesn't exist in login process.`))

    done()
  })
})
