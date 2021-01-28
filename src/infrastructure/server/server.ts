import { createServer } from 'http'
import express from 'express'
import bodyParser from 'body-parser'

import { serve as swaggerServe, setup as swaggerSetup } from 'swagger-ui-express'
import { swaggerDocument, swaggerOptions } from './apidoc'

import { authenticationRoutes, userRoutes, postRoutes } from './routes'

import { handleHttpError } from './middlewares'

import { createLogger } from '@common'
const logger = createLogger('server')

const app = express()
const port = parseInt(process.env.SERVER_PORT ?? '3000', 10)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/__/apidoc', swaggerServe, swaggerSetup(swaggerDocument, swaggerOptions))

app.use(authenticationRoutes)
app.use(userRoutes)
app.use(postRoutes)

app.use(handleHttpError)

const server = createServer(app)

const runServer = () => server.listen(port, () => logger.info(`Server running in http://localhost:${port}`))

const stopServer = () => {
  logger.info('Clossing server...')
  server.close()
}

export { server, runServer, stopServer }
