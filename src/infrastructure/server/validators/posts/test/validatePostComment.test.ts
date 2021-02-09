import { generateMockedMongoDbId } from '@testingFixtures'

import { validatePostCommentParams } from '@infrastructure/server/validators'

const testingPostId = generateMockedMongoDbId()
const testingCommentId = generateMockedMongoDbId()

describe('[API] - Validation - validatePostCommentParams', () => {
  it('must validate the provided data successfully', () => {
    const postCommentData = {
      postId: testingPostId,
      commentId: testingCommentId
    }

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when postId is not provided', () => {
    const postCommentData = {
      commentId: testingCommentId
    }
    const expectedErrorMessage = '"postId" is required'

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBeUndefined()
    expect(value).toHaveProperty('commentId')
    expect(value.commentId).toBe<string>(postCommentData.commentId)
  })

  it('must return an error when postId is empty', () => {
    const postCommentData = {
      postId: '',
      commentId: testingCommentId
    }
    const expectedErrorMessage = '"postId" is not allowed to be empty'

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when postId has more characters than allowed ones', () => {
    const postCommentData = {
      postId: testingPostId.concat('abcde'),
      commentId: testingCommentId
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when postId has less characters than required ones', () => {
    const postCommentData = {
      postId: testingPostId.substring(1),
      commentId: testingCommentId
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when postId has non allowed characters', () => {
    const postCommentData = {
      postId: testingPostId.substring(3).concat('$%#'),
      commentId: testingCommentId
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when commentId is not provided', () => {
    const postCommentData = {
      postId: testingPostId
    }
    const expectedErrorMessage = '"commentId" is required'

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentId')
    expect(value.commentId).toBeUndefined()
  })

  it('must return an error when commentId is empty', () => {
    const postCommentData = {
      postId: testingPostId,
      commentId: ''
    }
    const expectedErrorMessage = '"commentId" is not allowed to be empty'

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when commentId has more characters than allowed ones', () => {
    const postCommentData = {
      postId: testingPostId,
      commentId: testingCommentId.concat('abcde')
    }
    const expectedErrorMessage = `"commentId" with value "${postCommentData.commentId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when commentId has less characters than required ones', () => {
    const postCommentData = {
      postId: testingPostId,
      commentId: testingCommentId.substring(1)
    }
    const expectedErrorMessage = `"commentId" with value "${postCommentData.commentId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when commentId has non allowed characters', () => {
    const postCommentData = {
      postId: testingPostId,
      commentId: testingCommentId.substring(3).concat('$%#')
    }
    const expectedErrorMessage = `"commentId" with value "${postCommentData.commentId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validatePostCommentParams(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })
})
