import { TokenExpiredError, CheckingTokenError } from '@errors'
import { testingExpiredJwtToken, testingMalformedJwtToken, testingUsers } from '@testingFixtures'

import { checkToken } from '@domainServices'

const [{ id: userId, token: validToken, username }] = testingUsers

describe('[SERVICES] Authentication - checkToken', () => {
  it('must return the token content decoded', () => {
    const token = validToken
    const result = checkToken(token)
    const expectedFields = ['exp', 'iat', 'sub', 'username']
    const retrievedTokenFields = Object.keys(result).sort()
    expect(retrievedTokenFields.sort()).toEqual(expectedFields.sort())

    expect(result.exp).toBeGreaterThan(0)
    expect(result.iat).toBeGreaterThan(0)
    expect(result.sub).toBe(userId)
    expect(result.username).toBe(username)
  })

  it('must throw an UNAUTHORIZED (401) error when the token is expired', () => {
    const token = testingExpiredJwtToken
    const expectedError = new TokenExpiredError(`Token '${token}' expired`)

    expect(() => checkToken(token)).toThrowError(expectedError)
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the verification process fails', async () => {
    const token = testingMalformedJwtToken
    const errorMessage = 'invalid token'
    const expectedError = new CheckingTokenError(`Error ckecking token '${token}'. ${errorMessage}`)

    expect(() => checkToken(token)).toThrowError(expectedError)
  })
})
