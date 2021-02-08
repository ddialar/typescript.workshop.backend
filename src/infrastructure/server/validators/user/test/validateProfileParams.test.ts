import { testingUsers } from '@testingFixtures'

import { validateProfileParams } from '@infrastructure/server/validators'
import { NewUserProfileDto } from '@infrastructure/dtos'

const [{ name, surname, avatar }] = testingUsers

describe('[API] - Validation - validateProfileParams', () => {
  it('must validate the provided data successfully', () => {
    const profileData = {
      name,
      surname,
      avatar
    }

    const { error, value } = validateProfileParams(profileData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })

  it('must validate successfully the provided data when only the name is updated', () => {
    const profileData = {
      name
    }

    const { error, value } = validateProfileParams(profileData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('name')
    expect(value?.name).toBe(profileData.name)
    expect(value).toHaveProperty('surname')
    expect(value?.surname).toBeUndefined()
    expect(value).toHaveProperty('avatar')
    expect(value?.avatar).toBeUndefined()
  })

  it('must return an error when the provided name has not the minimum amount of characters', () => {
    const profileData = {
      name: 'J',
      surname,
      avatar
    }
    const expectedErrorMessage = '"name" length must be at least 2 characters long'

    const { error, value } = validateProfileParams(profileData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })

  it('must validate successfully the provided data when only the surname is updated', () => {
    const profileData = {
      surname
    }

    const { error, value } = validateProfileParams(profileData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('name')
    expect(value?.name).toBeUndefined()
    expect(value).toHaveProperty('surname')
    expect(value?.surname).toBe(profileData.surname)
    expect(value).toHaveProperty('avatar')
    expect(value?.avatar).toBeUndefined()
  })

  it('must return an error when the provided surname has not the minimum amount of characters', () => {
    const profileData = {
      name,
      surname: 'J',
      avatar
    }
    const expectedErrorMessage = '"surname" length must be at least 2 characters long'

    const { error, value } = validateProfileParams(profileData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })

  it('must validate successfully the provided data when only the avatar is updated', () => {
    const profileData = {
      avatar
    }

    const { error, value } = validateProfileParams(profileData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('name')
    expect(value?.name).toBeUndefined()
    expect(value).toHaveProperty('surname')
    expect(value?.surname).toBeUndefined()
    expect(value).toHaveProperty('avatar')
    expect(value?.avatar).toBe(profileData.avatar)
  })

  it('must return an error when the provided avatar is an empty string', () => {
    const profileData = {
      name,
      surname,
      avatar: ''
    }
    const expectedErrorMessage = '"avatar" is not allowed to be empty'

    const { error, value } = validateProfileParams(profileData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })

  it('must return an error when the provided avatar has a schema different to http or https', () => {
    const profileData = {
      name,
      surname,
      avatar: avatar.replace('https', 'git')
    }
    const expectedErrorMessage = '"avatar" must be a valid uri with a scheme matching the http|https pattern'

    const { error, value } = validateProfileParams(profileData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })

  it('must return an error when the provided avatar has less than two domains', () => {
    const profileData = {
      name,
      surname,
      avatar: avatar.replace('cdn.icon-icons.', '')
    }
    const expectedErrorMessage = '"avatar" must contain a valid domain name'

    const { error, value } = validateProfileParams(profileData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual<NewUserProfileDto>(profileData)
  })
})
