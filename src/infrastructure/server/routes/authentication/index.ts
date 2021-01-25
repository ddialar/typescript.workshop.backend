import express from 'express'

import { loginRoutes } from './login.routes'

const authenticationRoutes = express.Router()

authenticationRoutes.use('', loginRoutes)

export { authenticationRoutes }
