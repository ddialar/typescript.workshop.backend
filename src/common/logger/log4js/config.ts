export const config = {
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%r] (%20.20c) - [%[%5.5p%]] - %m%'
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
