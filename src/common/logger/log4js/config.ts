import { configure } from 'log4js'

const config = {
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%[%5.5p%]] - %m%'
      }
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: process.env.LOGGER_LEVEL || 'all'
    }
  }
}

export const logger = configure(config).getLogger()
