import { testingValidJwtTokenForNonPersistedUser, testingMalformedJwtToken } from '@testingFixtures'

import { validateToken } from '@infrastructure/server/validators'

describe('[API] - Validation - validateToken', () => {
  it('must validate the provided token successfully', () => {
    const token = testingValidJwtTokenForNonPersistedUser

    const { error, value } = validateToken(token)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('token')
    expect(value.token).toBe(token)
  })

  it('must return an error when token is not provided', () => {
    const { error, value } = validateToken(undefined)

    const expectedErrorMessage = '"token" is required'

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('token')
    expect(value.token).toBeUndefined()
  })

  it('must return an error when the provided token has not a valid structure because it includes non allowed characters', () => {
    const token = testingMalformedJwtToken + '$'

    const expectedErrorMessage = `"token" with value "${token}" fails to match the required pattern: /^[a-zA-Z0-9]+\\.[a-zA-Z0-9]+\\.[a-zA-Z0-9-_]+$/`

    const { error, value } = validateToken(token)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('token')
    expect(value.token).toBe(token)
  })

  it('must return an error when the provided token has not a valid structure because it is incomplete', () => {
    const token = testingMalformedJwtToken.split('.').shift()

    const expectedErrorMessage = `"token" with value "${token}" fails to match the required pattern: /^[a-zA-Z0-9]+\\.[a-zA-Z0-9]+\\.[a-zA-Z0-9-_]+$/`

    const { error, value } = validateToken(token)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('token')
    expect(value.token).toBe(token)
  })
})
