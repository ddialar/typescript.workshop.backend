import { hash, compare } from 'bcrypt'
import { CheckingPasswordError } from '@errors'

const bcryptSalt = parseInt(process.env.BCRYPT_SALT!, 10)

export const hashPassword = async (password: string): Promise<string> => hash(password, bcryptSalt)
export const checkPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await compare(plainPassword, hashedPassword)
  } catch ({ message }) {
    throw new CheckingPasswordError(`Error checking password. ${message}`)
  }
}
