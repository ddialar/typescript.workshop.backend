import { generateMockedMongoDbId } from '@testingFixtures'

import { validatePostParams } from '@infrastructure/server/validators'

const testingPostId = generateMockedMongoDbId()

describe('[API] - Validation - validatePostParams', () => {
  it('must validate the provided data successfully', () => {
    const postId = testingPostId

    const { error, value } = validatePostParams(postId)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postId)
  })

  it('must return an error when postId is not provided', () => {
    const postId = undefined
    const expectedErrorMessage = '"postId" is required'

    const { error, value } = validatePostParams(postId)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBeUndefined()
  })

  it('must return an error when postId is empty', () => {
    const postId = ''
    const expectedErrorMessage = '"postId" is not allowed to be empty'

    const { error, value } = validatePostParams(postId)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postId)
  })

  it('must return an error when postId has more characters than allowed ones', () => {
    const postId = testingPostId.concat('abcde')
    const expectedErrorMessage = `"postId" with value "${postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostParams(postId)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postId)
  })

  it('must return an error when postId has less characters than required ones', () => {
    const postId = testingPostId.substring(1)
    const expectedErrorMessage = `"postId" with value "${postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostParams(postId)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postId)
  })

  it('must return an error when postId has non allowed characters', () => {
    const postId = testingPostId.substring(3).concat('$%#')
    const expectedErrorMessage = `"postId" with value "${postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostParams(postId)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postId)
  })
})
