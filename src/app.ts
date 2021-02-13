import { appLogger } from '@logger'

import { runServer, stopServer } from '@infrastructure/server'
import { runOrm, stopOrm } from '@infrastructure/orm'

const startApplication = async () => {
  await runOrm()
  runServer()
}

const closeApplication = async () => {
  await stopOrm()
  stopServer()
  appLogger('info', 'Service successfully closed.')
}

process.on('SIGINT', async () => closeApplication())
process.on('SIGTERM', async () => closeApplication())

if (process.env.NODE_ENV !== 'test') { startApplication() }
