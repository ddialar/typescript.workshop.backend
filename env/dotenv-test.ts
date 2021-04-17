import { resolve } from 'path'
import { config } from 'dotenv'

module.exports = async () => {
  config({ path: resolve(__dirname, '../env/.env.test') })
}
