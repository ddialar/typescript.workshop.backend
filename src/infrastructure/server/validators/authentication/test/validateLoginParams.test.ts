import { LoginInputParams } from '@infrastructure/types'
import { testingUsers, testingValidPlainPassword } from '@testingFixtures'

import { validateLoginParams } from '@infrastructure/server/validators'

const [{ username }] = testingUsers

describe('[API] - Validation - validateLoginParams', () => {
  it('must validate the provided data successfully', () => {
    const loginData: LoginInputParams = {
      username,
      password: testingValidPlainPassword
    }

    const { error, value } = validateLoginParams(loginData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<LoginInputParams>(loginData)
  })

  it('must return an error when username is not provided', () => {
    const loginData = {
      password: testingValidPlainPassword
    }
    const expectedErrorMessage = '"username" is required'

    const { error, value } = validateLoginParams(loginData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('username')
    expect(value.username).toBeUndefined()
    expect(value).toHaveProperty<string>('password')
    expect(value.password).toBe(loginData.password)
  })

  it('must return an error when the provided username has not a valid structure', () => {
    const loginData = {
      username: '@wrong.mail.com',
      password: testingValidPlainPassword
    }
    const expectedErrorMessage = '"username" must be a valid email'

    const { error, value } = validateLoginParams(loginData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<LoginInputParams>(loginData)
  })

  it('must return an error when password is not provided', () => {
    const loginData = {
      username
    }
    const expectedErrorMessage = '"password" is required'

    const { error, value } = validateLoginParams(loginData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty<string>('username')
    expect(value.username).toBe(loginData.username)
    expect(value).toHaveProperty<string>('password')
    expect(value.password).toBeUndefined()
  })

  it('must return an error when the provided password has not a valid structure', () => {
    const loginData = {
      username,
      password: '123' // Password too short.
    }
    const expectedErrorMessage = `"password" with value "${loginData.password}" fails to match the required pattern: /^[a-zA-Z0-9]{4,}$/`

    const { error, value } = validateLoginParams(loginData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<LoginInputParams>(loginData)
  })

  it('must return an error when the provided password contains not valid elements', () => {
    const loginData = {
      username,
      password: '123$#%'
    }
    const expectedErrorMessage = `"password" with value "${loginData.password}" fails to match the required pattern: /^[a-zA-Z0-9]{4,}$/`

    const { error, value } = validateLoginParams(loginData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<LoginInputParams>(loginData)
  })
})
