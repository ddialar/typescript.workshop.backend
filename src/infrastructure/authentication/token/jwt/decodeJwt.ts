import { verify, Secret } from 'jsonwebtoken'
import { DecodedJwtToken } from '@infrastructure/types'

export const decodeJwt = (encodedToken: string) => {
  const secret: Secret = process.env.JWT_KEY!
  return verify(encodedToken, secret) as DecodedJwtToken
}
