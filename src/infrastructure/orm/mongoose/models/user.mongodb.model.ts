import mongoose, { Schema, Document, Model } from 'mongoose'
import { MONGO_SCHEMA_OPTIONS } from '../core'
import { UserDto } from '@infrastructure/dtos'

type UserMongooseModel = Omit<UserDto, '_id'> & Document

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, immutable: true },
  password: { type: String, required: true },
  email: { type: String, required: true, immutable: true },
  name: { type: String, default: '' },
  surname: { type: String, default: '' },
  avatar: { type: String, default: '' },
  token: { type: String, default: '' },
  enabled: { type: Boolean, required: true, default: true },
  deleted: { type: Boolean, required: true, default: false },
  lastLoginAt: { type: String, default: '' }
}, MONGO_SCHEMA_OPTIONS)

export const User: Model<UserMongooseModel> = mongoose.model('User', UserSchema)
