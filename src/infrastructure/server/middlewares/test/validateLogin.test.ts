import { Response, NextFunction } from 'express'
import { RequestDto } from '@infrastructure/server/serverDtos'
import { testingUsers, testingValidPlainPassword } from '@testingFixtures'

import { validateLogin } from '@infrastructure/server/middlewares'
import { LoginDataError } from '@errors'

const [{ username }] = testingUsers

describe('[API] - Middleware - validateLogin', () => {
  let mockedRequest: Partial<RequestDto>
  let mockedResponse: Partial<Response>
  const mockedNextfunction: NextFunction = jest.fn()

  beforeEach(() => {
    mockedRequest = {}
    mockedResponse = {}
  })

  it('must validate the login data successfully', () => {
    const loginData = {
      username,
      password: testingValidPlainPassword
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toStrictEqual(loginData)
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).not.toBeCalledWith(new LoginDataError())
  })

  it('must pass a BAD_REQUEST (400) error to the next middleware when username is not provided', () => {
    const loginData = {
      password: testingValidPlainPassword
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toBeUndefined()
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).toBeCalledWith(new LoginDataError())
  })

  it('must return an error when the provided username has not a valid structure', () => {
    const loginData = {
      username: '@wrong.mail.com',
      password: testingValidPlainPassword
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toBeUndefined()
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).toBeCalledWith(new LoginDataError())
  })

  it('must return an error when password is not provided', () => {
    const loginData = {
      username
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toBeUndefined()
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).toBeCalledWith(new LoginDataError())
  })

  it('must return an error when the provided password has not a valid structure', () => {
    const loginData = {
      username,
      password: '123' // Password too short.
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toBeUndefined()
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).toBeCalledWith(new LoginDataError())
  })

  it('must return an error when the provided password contains not valid elements', () => {
    const loginData = {
      username,
      password: '123$#%'
    }

    mockedRequest = {
      body: loginData
    }

    validateLogin(mockedRequest as RequestDto, mockedResponse as Response, mockedNextfunction)

    expect(mockedRequest.loginData).toBeUndefined()
    expect(mockedNextfunction).toBeCalledTimes(1)
    expect(mockedNextfunction).toBeCalledWith(new LoginDataError())
  })
})
