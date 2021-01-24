import { configure, getLogger } from 'log4js'
import { config } from './config'

configure(config)

export const createLogger = (section: string | undefined) => getLogger(section)
