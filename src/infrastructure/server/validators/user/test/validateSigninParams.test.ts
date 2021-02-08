import { testingUsers, testingValidPlainPassword } from '@testingFixtures'

import { validateSigninParams } from '@infrastructure/server/validators'
import { NewUserInputDto } from '@infrastructure/dtos'

const [{ email, name, surname, avatar }] = testingUsers

describe('[API] - Validation - validateSigninParams', () => {
  it('must validate the provided data successfully', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname,
      avatar
    }

    const { error, value } = validateSigninParams(signinData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when email is not provided', () => {
    const signinData = {
      password: testingValidPlainPassword,
      name,
      surname,
      avatar
    }
    const expectedErrorMessage = '"email" is required'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ email: undefined, ...signinData })
  })

  it('must return an error when the provided email has not a valid structure', () => {
    const signinData = {
      email: '@wrong.mail.com',
      password: testingValidPlainPassword,
      name,
      surname,
      avatar
    }
    const expectedErrorMessage = '"email" must be a valid email'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when password is not provided', () => {
    const signinData = {
      email,
      name,
      surname,
      avatar
    }
    const expectedErrorMessage = '"password" is required'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ password: undefined, ...signinData })
  })

  it('must return an error when the provided password has not a valid structure', () => {
    const signinData = {
      email,
      password: '123', // Password too short.
      name,
      surname,
      avatar
    }
    const expectedErrorMessage = `"password" with value "${signinData.password}" fails to match the required pattern: /^[a-zA-Z0-9]{4,}$/`

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when the provided password contains not valid elements', () => {
    const signinData = {
      email,
      password: '123$#%',
      name,
      surname,
      avatar
    }
    const expectedErrorMessage = `"password" with value "${signinData.password}" fails to match the required pattern: /^[a-zA-Z0-9]{4,}$/`

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when name is not provided', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      surname,
      avatar
    }
    const expectedErrorMessage = '"name" is required'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ name: undefined, ...signinData })
  })

  it('must return an error when the provided name has not the minimum amount of characters', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name: 'J',
      surname,
      avatar
    }
    const expectedErrorMessage = '"name" length must be at least 2 characters long'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when surname is not provided', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      avatar
    }
    const expectedErrorMessage = '"surname" is required'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ surname: undefined, ...signinData })
  })

  it('must return an error when the provided surname has not the minimum amount of characters', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname: 'J',
      avatar
    }
    const expectedErrorMessage = '"surname" length must be at least 2 characters long'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when avatar is not provided', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname
    }
    const expectedErrorMessage = '"avatar" is required'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ avatar: undefined, ...signinData })
  })

  it('must return an error when the provided avatar is an empty string', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname,
      avatar: ''
    }
    const expectedErrorMessage = '"avatar" is not allowed to be empty'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when the provided avatar has a schema different to http or https', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname,
      avatar: avatar.replace('https', 'git')
    }
    const expectedErrorMessage = '"avatar" must be a valid uri with a scheme matching the http|https pattern'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })

  it('must return an error when the provided avatar has less than two domains', () => {
    const signinData = {
      email,
      password: testingValidPlainPassword,
      name,
      surname,
      avatar: avatar.replace('cdn.icon-icons.', '')
    }
    const expectedErrorMessage = '"avatar" must contain a valid domain name'

    const { error, value } = validateSigninParams(signinData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserInputDto>(signinData)
  })
})
