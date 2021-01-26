import * as mongodb from './mongoose'

export { mongodb }

export const runOrm = async () => {
  await mongodb.connect()
}

export const stopOrm = async () => {
  await mongodb.disconnect()
}
