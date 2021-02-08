import { generateMockedMongoDbId } from '@testingFixtures'

import { validateNewPostComment } from '@infrastructure/server/validators'

const testingPostId = generateMockedMongoDbId()
const testingPostCommentBody = 'This is a post comment'

describe('[API] - Validation - validateNewPostComment', () => {
  it('must validate the provided data successfully', () => {
    const postCommentData = {
      postId: testingPostId,
      commentBody: testingPostCommentBody
    }

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).toBeUndefined()

    expect(value).not.toBeUndefined()
    expect(value).toStrictEqual(postCommentData)
  })

  it('must return an error when postId is not provided', () => {
    const postCommentData = {
      commentBody: testingPostCommentBody
    }
    const expectedErrorMessage = '"postId" is required'

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBeUndefined()
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBe<string>(postCommentData.commentBody)
  })

  it('must return an error when postId has more characters than allowed ones', () => {
    const postCommentData = {
      postId: testingPostId.concat('abcde'),
      commentBody: testingPostCommentBody
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBe<string>(postCommentData.commentBody)
  })

  it('must return an error when postId has less characters than required ones', () => {
    const postCommentData = {
      postId: testingPostId.substring(1),
      commentBody: testingPostCommentBody
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBe<string>(postCommentData.commentBody)
  })

  it('must return an error when postId has non allowed characters', () => {
    const postCommentData = {
      postId: testingPostId.substring(3).concat('$%#'),
      commentBody: testingPostCommentBody
    }
    const expectedErrorMessage = `"postId" with value "${postCommentData.postId}" fails to match the required pattern: /^[a-zA-Z0-9]{24}$/`

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBe<string>(postCommentData.commentBody)
  })

  it('must return an error when commentBody is not provided', () => {
    const postCommentData = {
      postId: testingPostId
    }
    const expectedErrorMessage = '"commentBody" is required'

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBeUndefined()
  })

  it('must return an error when commentBody is empty', () => {
    const postCommentData = {
      postId: testingPostId,
      commentBody: ''
    }
    const expectedErrorMessage = '"commentBody" is not allowed to be empty'

    const { error, value } = validateNewPostComment(postCommentData)

    expect(error).not.toBeUndefined()
    expect(error).toBe(expectedErrorMessage)

    expect(value).not.toBeUndefined()
    expect(value).toHaveProperty('postId')
    expect(value.postId).toBe<string>(postCommentData.postId)
    expect(value).toHaveProperty('commentBody')
    expect(value.commentBody).toBe<string>(postCommentData.commentBody)
  })
})
