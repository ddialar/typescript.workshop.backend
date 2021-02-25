import { QueryFindOneAndUpdateOptions } from 'mongoose'
import { User } from '../models'
import { UserDto, NewUserDatabaseDto, UpdateUserPayloadDto, UserProfileDto } from '@infrastructure/dtos'

export const create = async (newUserData: NewUserDatabaseDto): Promise<UserDto> => {
  await (new User(newUserData)).save()
  return await User.findOne({ username: newUserData.username }).lean<UserDto>()
}

export const getByUsername = async (username: string): Promise<UserDto | null> =>
  User.findOne({ username }).lean<UserDto>()

export const getByToken = async (token: string): Promise<UserDto | null> =>
  User.findOne({ token }).lean<UserDto>()

export const getProfileById = async (id: string): Promise<UserProfileDto | null> =>
  User.findById(id).select('-_id username email name surname avatar').lean<UserProfileDto>()

export const updateById = async (id: string, payload: UpdateUserPayloadDto): Promise<UserDto | null> => {
  // NOTE: Besides to define the fields as 'immutable' in the schema definition, it's required to use the 'strict' option 'cos in opposite, the field can be overwriten anyway :(
  const update = payload
  const options: QueryFindOneAndUpdateOptions = { new: true, strict: 'throw' }

  return await User.findByIdAndUpdate(id, update, options).lean<UserDto>()
}
