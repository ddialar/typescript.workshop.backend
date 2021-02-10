import { validateNewPostParams } from '@infrastructure/server/validators'

const testingPostBody = 'This is a post body'

describe('[API] - Validation - validateNewPostParams', () => {
  it('must validate the provided data successfully', () => {
    const postBody = testingPostBody

    const { error, value } = validateNewPostParams(postBody)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ postBody })
  })

  it('must return an error when postBody is not provided', () => {
    const postBody = undefined
    const expectedErrorMessage = '"postBody" is required'

    const { error, value } = validateNewPostParams(postBody)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ postBody })
  })

  it('must return an error when postBody is empty', () => {
    const postBody = ''
    const expectedErrorMessage = '"postBody" is not allowed to be empty'

    const { error, value } = validateNewPostParams(postBody)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual({ postBody })
  })
})
