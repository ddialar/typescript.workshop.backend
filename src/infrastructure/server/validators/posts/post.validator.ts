import Joi from 'joi'

import { postId, postBody } from '../validation.rules'
import { PostDto } from '@infrastructure/dtos'

const newPostSchema = Joi.object({ postBody })
const postSchema = Joi.object({ postId })

interface ValidationResult<T> {
  error?: string
  value: T
}

interface NewPostParams {
  postBody: Required<PostDto>['body']
}

export const validateNewPostParams = (postBody: string | undefined): ValidationResult<NewPostParams> => {
  const { error, value } = newPostSchema.validate({ postBody })

  return {
    error: error && error.details[0].message,
    value
  }
}

interface PostParams {
  postId: Required<PostDto>['_id']
}

export const validatePostParams = (postId: string | undefined): ValidationResult<PostParams> => {
  const { error, value } = postSchema.validate({ postId })

  return {
    error: error && error.details[0].message,
    value
  }
}
