import { User } from '../models'
import { UserDto, UpdateUserPayloadDto } from '@infrastructure/dtos'
import { QueryFindOneAndUpdateOptions } from 'mongoose'

export const getByUsername = async (username: string): Promise<UserDto | null> => {
  const user = await User.findOne({ username }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : user
}

export const updateById = async (id: string, payload: UpdateUserPayloadDto): Promise<UserDto | null> => {
  const update = payload
  const options: QueryFindOneAndUpdateOptions = { new: true, strict: 'throw' }

  const updatedUser = await User.findByIdAndUpdate(id, update, options)
  return updatedUser ? updatedUser.toJSON() as UserDto : null
}
