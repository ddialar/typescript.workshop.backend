import mongoose, { Schema } from 'mongoose'
import { MONGO_SCHEMA_OPTIONS } from '../core'

const PostOwnerSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, default: '' },
  avatar: { type: String, default: null }
}, MONGO_SCHEMA_OPTIONS)

const PostCommentOwnerSchema = PostOwnerSchema
const PostLikeOwnerSchema = PostOwnerSchema

const PostCommentSchema = new Schema({
  body: { type: String, required: true },
  owner: { type: PostCommentOwnerSchema, required: true }
}, MONGO_SCHEMA_OPTIONS)

const PostSchema = new Schema({
  body: { type: String, required: true },
  owner: { type: PostOwnerSchema, required: true },
  comments: { type: [PostCommentSchema], required: true, default: [] },
  likes: { type: [PostLikeOwnerSchema], required: true, default: [] }
}, MONGO_SCHEMA_OPTIONS)

export const Post = mongoose.model('Post', PostSchema)
