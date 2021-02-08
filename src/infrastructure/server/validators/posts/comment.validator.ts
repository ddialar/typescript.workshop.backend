import Joi from 'joi'

import { postId, commentBody } from '../validation.rules'
import { PostDto } from '@infrastructure/dtos'

const newCommentSchema = Joi.object({ postId, commentBody })

interface ValidationResult<T> {
  error?: string
  value: T
}

interface NewCommentParams {
  postId: Required<PostDto>['_id']
  commentBody: Required<PostDto>['body']
}

export const validateNewPostComment = ({ postId, commentBody }: Partial<NewCommentParams>): ValidationResult<NewCommentParams> => {
  const { error, value } = newCommentSchema.validate({ postId, commentBody })

  return {
    error: error && error.details[0].message,
    value
  }
}
