import { createLogger } from '@common'
import { mongoose, MONGO_URI, MONGO_OPTIONS } from './config'

const logger = createLogger('mongoose')

export const connect = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI, MONGO_OPTIONS)
    if (!connection) {
      logger.error('DDBB connection failed.')
    }
  } catch ({ message }) {
    logger.error(`DDBB connection error. ${message}`)
  }
}
