import { User } from '../models'
import { UserDto } from '@infrastructure/dtos'

export const getByUsername = async (username: string): Promise<UserDto | null> => {
  const user = await User.findOne({ username }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : user
}
