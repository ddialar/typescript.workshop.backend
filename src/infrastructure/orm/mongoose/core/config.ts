import { mongooseLogger } from '@logger'

import mongoose, { ConnectionOptions } from 'mongoose'
import Bluebird from 'bluebird'

mongoose.Promise = Bluebird

mongoose.connection.on('connected', () => {
  mongooseLogger('info', `DDBB '${mongoose.connection.db.databaseName}' connection success.`)
})

mongoose.connection.on('disconnected', () => {
  mongooseLogger('info', 'DDBB connection successfully closed.')
})

mongoose.connection.on('error', ({ message }) => {
  mongooseLogger('error', `Initialization error. ${message}`)
})

const MONGO_USER = process.env.MONGO_USER
const MONGO_PASS = process.env.MONGO_PASS
const MONGO_HOST = process.env.MONGO_HOST
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = process.env.MONGO_DB

const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`

const MONGO_OPTIONS: ConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

const MONGO_SCHEMA_OPTIONS = {
  versionKey: false,
  timestamps: true,
  toJSON: {
    versionKey: false
    // transform: (doc: unknown, ret: Record<string, unknown>, options: unknown) => {
    //   if (ret._id) {
    //     ret.id = ret._id
    //     delete ret._id
    //   }
    //   return ret
    // }
  }
}

export { mongoose, MONGO_DB, MONGO_URI, MONGO_OPTIONS, MONGO_SCHEMA_OPTIONS }
