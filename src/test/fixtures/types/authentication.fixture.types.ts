import { Algorithm, Secret } from 'jsonwebtoken'

export interface JwtFixtureParams {
  userId: string
  username: string
  secret: Secret
  algorithm: Algorithm
  expiresIn: number
}

export type PrePopulatedJwt = Omit<JwtFixtureParams, 'expiresIn'> & { tokenName: string, expiresAt: number }

export interface AuthenticationFixture {
  [key: string]: {
    value: string
    comments: {
      plainPasswd?: string
      hashedWith?: string
      saltValue?: number
      username?: string
      algorithm?: string
      expiresAt?: string
    }
  }
}
