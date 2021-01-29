import { Types } from 'mongoose'

import { UserDto } from '@infrastructure/dtos'
import { mongodb } from '@infrastructure/orm'

const { models: { User } } = mongodb

type OptionalUserData = Partial<UserDto>
type MongoDbAdaptedUserData = Omit<OptionalUserData, '_id'> & { _id?: string | Types.ObjectId }

const parseUserDataFixture = (userData: OptionalUserData) => {
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

export const cleanUsersCollectionFixture = async () => User.deleteMany({})

export const saveUserFixture = async (userData: OptionalUserData) => {
  const parsedUserData = parseUserDataFixture(userData)
  return (await (new User(parsedUserData)).save()).toJSON() as UserDto
}

export const getUserByUsernameFixture = async (username: string) => (await User.findOne({ username }))?.toJSON() as UserDto
