import { verify, Secret } from 'jsonwebtoken'
import { testingUsers, testingValidPlainPassword } from '@testingFixtures'

import { login } from '@domainServices'
import { DecodedJwtToken } from '@infrastructure/types'

const secret: Secret = process.env.JWT_KEY!

describe('[SERVICES] Authentication - login', () => {
  it('must authenticate the user and return a valid identification object', async (done) => {
    const [{ username }] = testingUsers
    const password = testingValidPlainPassword

    const authenticationData = await login(username, password)

    expect(authenticationData.token).not.toBe('')

    const verifiedToken = verify(authenticationData.token as string, secret) as DecodedJwtToken
    const expectedFields = ['exp', 'iat', 'sub', 'username']
    const retrievedTokenFields = Object.keys(verifiedToken).sort()
    expect(retrievedTokenFields.sort()).toEqual(expectedFields.sort())

    expect(verifiedToken.exp).toBeGreaterThan(0)
    expect(verifiedToken.iat).toBeGreaterThan(0)
    // expect(verifiedToken.sub).toBe(userId) // Implement the ORM in order to access this information.
    expect(verifiedToken.username).toBe(username)

    done()
  })
})
