import { RequestDto } from '@infrastructure/server/serverDtos'
import { Router } from 'express'
import { login } from '@domainServices'

import { validateLogin } from '@infrastructure/server/middlewares'

import { createLogger } from '@common'
const logger = createLogger('auth.endpoints')

const loginRoutes: Router = Router()

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
