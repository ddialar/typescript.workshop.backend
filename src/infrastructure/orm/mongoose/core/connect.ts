import { mongooseLogger } from '@logger'
import { mongoose, MONGO_URI, MONGO_OPTIONS } from './config'

export const connect = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI, MONGO_OPTIONS)
    if (!connection) {
      mongooseLogger('error', 'DDBB connection failed.')
    }
  } catch ({ message }) {
    mongooseLogger('error', `DDBB connection error. ${message}`)
  }
}
