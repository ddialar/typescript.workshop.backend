import path from 'path'
import { sign, SignOptions, Algorithm } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { AuthenticationFixture, JwtFixtureParams, PrePopulatedJwt } from './../types'
import { testingValidPlainPassword, testingWrongPlainPassword } from '../authentication.fixtures'

config({ path: path.join(__dirname, '../../../../env/.env.test') })

const bcryptSalt = parseInt(process.env.BCRYPT_SALT!, 10)
const plainPassword = testingValidPlainPassword
const wrongPlainPassword = testingWrongPlainPassword

const passwordMockedData: AuthenticationFixture = {
  validHashedPassword: {
    value: bcrypt.hashSync(plainPassword, bcryptSalt),
    comments: {
      plainPasswd: plainPassword,
      hashedWith: 'bcrypt',
      saltValue: bcryptSalt
    }
  },
  validPlainPassword: {
    value: plainPassword,
    comments: {}
  },
  wrongPlainPassword: {
    value: wrongPlainPassword,
    comments: {}
  }
}

const tokensToBeGenerated: PrePopulatedJwt[] = [
  {
    tokenName: 'validJwtTokenForNonPersistedUser',
    userId: '1',
    username: 'non.persisted@mail.com',
    algorithm: process.env.JWT_ALGORITHM as Algorithm || 'HS512',
    secret: process.env.JWT_KEY!,
    expiresAt: Date.parse('2120-10-31T07:43:09.000Z')
  },
  {
    tokenName: 'expiredJwtToken',
    userId: '2',
    username: 'test@mail.com',
    algorithm: process.env.JWT_ALGORITHM as Algorithm || 'HS512',
    secret: process.env.JWT_KEY!,
    expiresAt: 1000
  }
]

const encodeJwt = ({ userId, username, secret, algorithm, expiresIn }: JwtFixtureParams): string => {
  const payload = {
    sub: userId,
    username
  }
  const options: SignOptions = {
    algorithm,
    expiresIn
  }

  return sign(payload, secret, options)
}

const generateTokens = (tokensDataCollection: PrePopulatedJwt[]): AuthenticationFixture => tokensDataCollection.reduce((generated, { tokenName, userId, username, algorithm, secret, expiresAt }) => {
  const expiresIn = Math.trunc(expiresAt / 1000)
  const processedToken = {
    [tokenName]: {
      value: encodeJwt({ userId, username, algorithm, secret, expiresIn }),
      comments: {
        username,
        algorithm,
        expiresAt: (new Date(Date.now() > expiresAt ? Date.now() + expiresAt : expiresAt)).toISOString()
      }
    }
  }
  return { ...generated, ...processedToken }
}, {})

export const createdMokedAuthentication = (): AuthenticationFixture => ({
  ...passwordMockedData,
  ...generateTokens(tokensToBeGenerated)
})
