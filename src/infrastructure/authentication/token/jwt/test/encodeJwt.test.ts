import { verify, Secret } from 'jsonwebtoken'
import { encodeJwt } from '../encodeJwt'
import { DecodedJwtToken } from '@infrastructure/types'

import { testingUsers } from '@testingFixtures'

const { id: userId, username: testingUsername } = testingUsers[0]

describe('[AUTHENTICATION] Token - JWT', () => {
  describe('encodeJwt', () => {
    it('must generate a valid token', () => {
      const secret: Secret = process.env.JWT_KEY!

      let obtainedError = null

      try {
        const token = encodeJwt(userId, testingUsername)
        const verifiedToken = verify(token, secret) as DecodedJwtToken

        const expectedFields = ['exp', 'iat', 'sub', 'username']
        const retrievedTokenFields = Object.keys(verifiedToken).sort()
        expect(retrievedTokenFields.sort()).toEqual(expectedFields.sort())

        expect(verifiedToken.exp).toBeGreaterThan(0)
        expect(verifiedToken.iat).toBeGreaterThan(0)
        expect(verifiedToken.sub).toBe(userId)
        expect(verifiedToken.username).toBe(testingUsername)
      } catch (error) {
        obtainedError = error
      } finally {
        expect(obtainedError).toBeNull()
      }
    })
  })
})
