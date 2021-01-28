import { NextFunction, Request, Response } from 'express'
import { createLogger } from '@common'
import { ApiError } from '@errors'

const logger = createLogger('server')

export const handleHttpError = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
  const { status, message, description } = error

  logger.error(`${message}${description ? ' - ' + description : ''}`)

  res.status(status).send({ error: true, message })
}
