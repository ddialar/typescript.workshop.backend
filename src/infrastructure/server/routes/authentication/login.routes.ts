import express, { Router } from 'express'

import { createLogger } from '@common'
const logger = createLogger('auth.endpoints')

const loginRoutes: Router = express.Router()

loginRoutes.post('/login', async (req, res, next) => {
  // TODO Type the login params defining the LoginInputParams interface
  const { username, password } = req.body

  logger.debug(`Login process started for username: '${username}'.`)

  try {
    // TODO Login the user via specific service.
    res.json({ token: `This is your token for '${username}' and '${password}'.` })
  } catch (error) {
    next(error)
  }
})

export { loginRoutes }
