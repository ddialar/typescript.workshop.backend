import { Response } from 'express'
import { createLogger } from '@common'
import { ApiError } from '@errors'

const logger = createLogger('server')

export const handleHttpError = (error: ApiError, res: Response): void => {
  const { status, message, description } = error

  logger.error(`${message}${description ? ' - ' + description : ''}`)

  res.status(status).send({ error: true, message })
}
