import { createLogger } from './common'

import { runServer, stopServer } from './infrastructure/server'

const logger = createLogger('app')

const startApplication = async () => {
  runServer()
}

const closeApplication = async () => {
  stopServer()
  logger.info('Service successfully closed.')
}

process.on('SIGINT', async () => closeApplication())
process.on('SIGTERM', async () => closeApplication())

if (process.env.NODE_ENV !== 'test') { startApplication() }
