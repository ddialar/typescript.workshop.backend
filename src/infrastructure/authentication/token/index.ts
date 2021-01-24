import { encodeJwt, decodeJwt } from './jwt'

const generateToken = encodeJwt
const decodeToken = decodeJwt

export {
  generateToken,
  decodeToken
}
