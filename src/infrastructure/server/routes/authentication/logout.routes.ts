import express, { Router } from 'express'
import { logout } from '@domainServices'
import { OK } from '@errors'

import { RequestDto } from '../../serverDtos'
import { ensureAuthenticated } from '../../middlewares'
import { UserDomainModel } from '@domainModels'

import { createLogger } from '@common'
const logger = createLogger('auth.endpoints')

const logoutRoutes: Router = express.Router()

logoutRoutes.post('/logout', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id: userId, username } = req.user as UserDomainModel

  logger.debug(`Logout process started for username: '${username}'.`)

  try {
    await logout(userId)
    res.status(OK).end('User logged out successfully')
  } catch (error) {
    next(error)
  }
})

export { logoutRoutes }
