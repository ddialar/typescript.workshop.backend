import express, { Router } from 'express'
import { RequestDto } from '@infrastructure/server/serverDtos'

import { createUser } from '@domainServices'
import { CREATED } from '@errors'

import { mapNewUserFromDtoToDomainModel } from '@infrastructure/mappers'
import { validateSignin } from '@infrastructure/server/middlewares'

const signinRoutes: Router = express.Router()

signinRoutes.post('/signin', validateSignin, async (req: RequestDto, res, next) => {
  const newUserData = req.signinData!

  try {
    await createUser(mapNewUserFromDtoToDomainModel(newUserData))
    res.status(CREATED).end('User created')
  } catch (error) {
    next(error)
  }
})

export { signinRoutes }
