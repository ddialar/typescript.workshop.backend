const path = require('path')
const { sign } = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { config } = require('dotenv')

config({ path: path.join(__dirname, '../../../../env/.env.test') })

const bcryptSalt = parseInt(process.env.BCRYPT_SALT, 10)
const plainPassword = process.env.PLAIN_PASSWORD
const wrongPlainPassword = process.env.WRONG_PASSWORD

const passwordMockedData = {
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

const tokensToBeGenerated = [
  {
    tokenName: 'validJwtTokenForNonPersistedUser',
    userId: 1,
    username: 'non.persisted@mail.com',
    algorithm: process.env.JWT_ALGORITHM || 'HS512',
    secret: process.env.JWT_KEY,
    expiresAt: Date.parse('2120-10-31T07:43:09.000Z')
  },
  {
    tokenName: 'expiredJwtToken',
    userId: 2,
    username: 'test@mail.com',
    algorithm: process.env.JWT_ALGORITHM || 'HS512',
    secret: process.env.JWT_KEY,
    expiresAt: 1000
  }
]

const encodeJwt = ({ userId, username, secret, algorithm, expiresIn }) => {
  const payload = {
    sub: userId,
    username
  }
  const options = {
    algorithm,
    expiresIn
  }

  return sign(payload, secret, options)
}

const generateTokens = (tokensDataCollection) => tokensDataCollection.reduce((generated, { tokenName, userId, username, algorithm, secret, expiresAt }) => {
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

const createdMokedAuthentication = () => ({
  ...passwordMockedData,
  ...generateTokens(tokensToBeGenerated)
})

module.exports = { createdMokedAuthentication }
