import { Types } from 'mongoose'

import { UserDto } from '@infrastructure/dtos'
import { mongodb } from '@infrastructure/orm'

const { models: { User } } = mongodb

type OptionalUserData = Partial<UserDto>
type MongoDbAdaptedUserData = Omit<OptionalUserData, '_id'> & { _id?: string | Types.ObjectId }

const parseUserData = (userData: OptionalUserData) => {
  const { _id: plainId, ...otherFields } = userData
  let parsedUserData: MongoDbAdaptedUserData

  if (plainId) {
    parsedUserData = {
      _id: Types.ObjectId(plainId),
      ...otherFields
    }
  } else {
    parsedUserData = userData
  }

  return parsedUserData
}

export const cleanUsersCollection = async () => User.deleteMany({})

export const saveUser = async (userData: OptionalUserData) => {
  const parsedUserData = parseUserData(userData)
  return (await (new User(parsedUserData)).save()).toJSON() as UserDto
}
export const saveUsers = async (usersData: OptionalUserData[]) => {
  const parsedUsersData = usersData.map(parseUserData)
  await User.insertMany(parsedUsersData)
}

export const getUserByUsername = async (username: string) => (await User.findOne({ username }))?.toJSON() as UserDto
