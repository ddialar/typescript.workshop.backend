import { NextFunction, Request, Response } from 'express'
import { serverLogger } from '@logger'
import { ApiError } from '@errors'

export const handleHttpError = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
  const { status, message, description } = error

  serverLogger('error', `${message}${description ? ' - ' + description : ''}`)

  res.status(status).send({ error: true, message })
}
