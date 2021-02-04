import express, { Router } from 'express'

import { getUserProfile, updateUserProfile } from '@domainServices'

import { NewUserProfileDto } from '@infrastructure/dtos'
import { ensureAuthenticated } from '../../middlewares'
import { RequestDto } from '../../serverDtos'

import { createLogger } from '@common'
const logger = createLogger('user.endpoints')

const profileRoutes: Router = express.Router()

profileRoutes.get('/profile', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id } = req.user!

  logger.debug(`Retrieving profile for user '${id}'.`)

  try {
    res.json(await getUserProfile(id))
  } catch (error) {
    next(error)
  }
})

profileRoutes.put('/profile', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id } = req.user!
  const newProfileData = req.body as NewUserProfileDto

  logger.debug(`Updating profile for user '${id}'.`)

  try {
    res.json(await updateUserProfile(id, newProfileData))
  } catch (error) {
    next(error)
  }
})

export { profileRoutes }
