import { compare } from 'bcrypt'
import { CheckingPasswordError } from '@errors'

export const checkPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await compare(plainPassword, hashedPassword)
  } catch ({ message }) {
    throw new CheckingPasswordError(`Error checking password. ${message}`)
  }
}
