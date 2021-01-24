import express, { Router } from 'express'

import { createUser } from '@domainServices'
import { CREATED } from '@errors'

import { NewUserInputDto } from '@infrastructure/dtos'
import { mapNewUserFromDtoToDomainModel } from '@infrastructure/mappers'

const signinRoutes: Router = express.Router()

signinRoutes.post('/signin', async (req, res, next) => {
  const newUserData = req.body as NewUserInputDto

  try {
    await createUser(mapNewUserFromDtoToDomainModel(newUserData))
    res.status(CREATED).end('User created')
  } catch (error) {
    next(error)
  }
})

export { signinRoutes }
