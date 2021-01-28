import { QueryFindOneAndUpdateOptions } from 'mongoose'
import { User } from '../models'
import { UserDto, NewUserDatabaseDto, UpdateUserPayloadDto, UserProfileDto } from '@infrastructure/dtos'

export const create = async (newUserData: NewUserDatabaseDto): Promise<void> => {
  await (new User(newUserData)).save()
}

export const getByUsername = async (username: string): Promise<UserDto | null> => {
  const user = await User.findOne({ username }).lean()
  return user ? JSON.parse(JSON.stringify(user)) : user
}

export const getProfileById = async (id: string): Promise<UserProfileDto | null> => {
  const profile = await User.findById(id).select('-_id username email name surname avatar').lean()
  return profile ? JSON.parse(JSON.stringify(profile)) : profile
}

export const updateById = async (id: string, payload: UpdateUserPayloadDto): Promise<UserDto | null> => {
  // NOTE: Besides to define the fields as 'immutable' in the schema definition, it's required to use the 'strict' option 'cos in opposite, the field can be overwriten anyway :(
  const update = payload
  const options: QueryFindOneAndUpdateOptions = { new: true, strict: 'throw' }

  const updatedUser = await User.findByIdAndUpdate(id, update, options)
  return updatedUser ? updatedUser.toJSON() as UserDto : null
}
