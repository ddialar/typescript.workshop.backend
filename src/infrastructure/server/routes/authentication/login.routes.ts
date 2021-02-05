import express, { Router } from 'express'
import { login } from '@domainServices'

import { LoginInputParams } from '@infrastructure/types'
import { validateLogin } from '@infrastructure/server/middlewares'

import { createLogger } from '@common'
const logger = createLogger('auth.endpoints')

const loginRoutes: Router = express.Router()

loginRoutes.post('/login', validateLogin, async (req, res, next) => {
  const { username, password } = req.body as LoginInputParams

  logger.debug(`Login process started for username: '${username}'.`)

  try {
    res.json(await login(username, password))
  } catch (error) {
    next(error)
  }
})

export { loginRoutes }
