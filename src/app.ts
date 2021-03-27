import { appLogger } from '@logger'

import { runServer, stopServer } from '@infrastructure/server'
import { runOrm, stopOrm } from '@infrastructure/orm'
import { checkStartup } from './preset'

const startApplication = async () => {
  await runOrm()
  runServer()
}

const closeApplication = async () => {
  await stopOrm()
  stopServer()
  appLogger('info', 'Service successfully closed.')
}

const requiredEnvVariables = [
  'SERVER_PORT',
  'LOGGER_LEVEL',
  'MONGO_USER',
  'MONGO_PASS',
  'MONGO_HOST',
  'MONGO_PORT',
  'MONGO_DB',
  'BCRYPT_SALT',
  'JWT_KEY',
  'JWT_ALGORITHM',
  'JWT_EXPIRING_TIME_IN_SECONDS'
]

checkStartup(requiredEnvVariables)

process.on('SIGINT', async () => closeApplication())
process.on('SIGTERM', async () => closeApplication())

if (process.env.NODE_ENV !== 'test') { startApplication() }
