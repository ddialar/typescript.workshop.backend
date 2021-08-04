import { sign, Secret, SignOptions, Algorithm } from 'jsonwebtoken'
import { name } from 'faker'
import { avatarUrls } from '../assets/avatarUrls.json'
import { validHashedPassword } from '../assets/authentication.json'
import { generateMockedMongoDbId } from './utils'
import { UserDomainModel } from '@domainModels'
import { JwtPayload } from '@infrastructure/types'

const encodeJwt = (username: string, userId: string) => {
  const payload: JwtPayload = {
    sub: userId,
    username
  }
  const secret: Secret = process.env.JWT_KEY!
  const options: SignOptions = {
    algorithm: process.env.JWT_ALGORITHM as Algorithm || 'HS512',
    expiresIn: 3153600000 // 100 years
  }

  return sign(payload, secret, options)
}

const testingUserFactory = (usersAmount: number): UserDomainModel[] => {
  const avatars = [...avatarUrls]

  return [...Array(usersAmount)].map(() => {
    const userId = generateMockedMongoDbId()
    const firstName = name.firstName()
    const surname = name.lastName()
    const username = `${firstName.toLowerCase()}.${surname.toLowerCase()}@mail.com`
    const avatarIndex = Math.floor(Math.random() * (avatars.length - 1)) + 1

    return {
      id: userId,
      name: firstName,
      surname,
      email: username,
      username,
      password: validHashedPassword.value,
      avatar: avatars[avatarIndex],
      token: encodeJwt(username, userId),
      enabled: true,
      deleted: false,
      lastLoginAt: '',
      createdAt: (new Date()).toISOString().replace(/\dZ/, '0Z'),
      updatedAt: (new Date()).toISOString().replace(/\dZ/, '0Z')
    }
  })
}

export const createMockedUsers = (usersAmount: number) => testingUserFactory(usersAmount)
