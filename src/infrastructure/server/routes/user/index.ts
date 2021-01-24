import express from 'express'

import { signinRoutes } from './signin.routes'
import { profileRoutes } from './profile.routes'

const userRoutes = express.Router()

userRoutes.use('', signinRoutes)
userRoutes.use('', profileRoutes)

export { userRoutes }
