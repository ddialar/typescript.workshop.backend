import express from 'express'

import { loginRoutes } from './login.routes'
import { logoutRoutes } from './logout.routes'

const authenticationRoutes = express.Router()

authenticationRoutes.use('', loginRoutes)
authenticationRoutes.use('', logoutRoutes)

export { authenticationRoutes }
