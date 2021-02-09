import Joi from 'joi'

import { postId, commentId, commentBody } from '../validation.rules'
import { PostCommentDto, PostDto } from '@infrastructure/dtos'

const newCommentSchema = Joi.object({ postId, commentBody })
const commentSchema = Joi.object({ postId, commentId })

interface ValidationResult<T> {
  error?: string
  value: T
}

interface NewCommentParams {
  postId: Required<PostDto>['_id']
  commentBody: Required<PostDto>['body']
}

export const validateNewPostCommentParams = ({ postId, commentBody }: Partial<NewCommentParams>): ValidationResult<NewCommentParams> => {
  const { error, value } = newCommentSchema.validate({ postId, commentBody })

  return {
    error: error && error.details[0].message,
    value
  }
}

interface CommentParams {
  postId: Required<PostDto>['_id']
  commentId: Required<PostCommentDto>['_id']
}

export const validatePostCommentParams = ({ postId, commentId }: Partial<CommentParams>): ValidationResult<CommentParams> => {
  const { error, value } = commentSchema.validate({ postId, commentId })

  return {
    error: error && error.details[0].message,
    value
  }
}
