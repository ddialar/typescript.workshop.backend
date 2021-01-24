import { sign, Secret, SignOptions, Algorithm } from 'jsonwebtoken'
import { JwtPayload } from '@infrastructure/types'

export const encodeJwt = (userId: string, username: string): string => {
  const payload: JwtPayload = {
    sub: userId,
    username
  }
  const secret: Secret = process.env.JWT_KEY!
  const options: SignOptions = {
    algorithm: process.env.JWT_ALGORITHM as Algorithm ?? 'HS512',
    expiresIn: parseInt(process.env.JWT_EXPIRING_TIME_IN_SECONDS ?? '60', 10)
  }

  return sign(payload, secret, options)
}
