import { createServer } from 'http'
import express from 'express'
import bodyParser from 'body-parser'

import { createLogger } from '../../common'
const logger = createLogger('server')

const app = express()
const port = parseInt(process.env.SERVER_PORT ?? '3000', 10)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// REFACTOR Remove this endpoint.
app.get('/hello', (req, res) => {
  res.send('Welcome to the TS backend workshop!!!')
})

const server = createServer(app)

const runServer = () => server.listen(port, () => logger.info(`Server running in http://localhost:${port}`))

const stopServer = () => {
  logger.info('Clossing server...')
  server.close()
}

export { server, runServer, stopServer }
