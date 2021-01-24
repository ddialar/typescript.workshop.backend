import { mongoose } from './config'

export const disconnect = async () => {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect()
  }
}
