import express, { Router } from 'express'
import { login } from '@domainServices'

import { createLogger } from '@common'
import { validateLogin } from '@infrastructure/server/middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'
const logger = createLogger('auth.endpoints')

const loginRoutes: Router = express.Router()

loginRoutes.post('/login', validateLogin, async (req: RequestDto, res, next) => {
  const { username, password } = req.loginData!

  logger.debug(`Login process started for username: '${username}'.`)

  try {
    res.json(await login(username, password))
  } catch (error) {
    next(error)
  }
})

export { loginRoutes }
