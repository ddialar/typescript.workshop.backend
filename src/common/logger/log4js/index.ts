import { logger } from './config'

type LogTypes = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'mark'

export const appLogger = (logType: LogTypes, message: string) => logger[logType](`[app] - ${message}`)
export const serverLogger = (logType: LogTypes, message: string) => logger[logType](`[server] - ${message}`)
export const mongooseLogger = (logType: LogTypes, message: string) => logger[logType](`[mongoose] - ${message}`)
export const authEndpointsLogger = (logType: LogTypes, message: string) => logger[logType](`[auth.endpoints] - ${message}`)
export const postEndpointsLogger = (logType: LogTypes, message: string) => logger[logType](`[post.endpoints] - ${message}`)
export const userEndpointsLogger = (logType: LogTypes, message: string) => logger[logType](`[user.endpoints] - ${message}`)
