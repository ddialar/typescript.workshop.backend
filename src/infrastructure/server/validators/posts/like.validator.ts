import Joi from 'joi'

import { postId } from '../validation.rules'
import { PostDto } from '@infrastructure/dtos'

const schema = Joi.object({ postId })

interface ValidationResult {
  error?: string
  value?: {
    postId: Required<PostDto>['_id']
  }
}

export const validatePostLikeParams = (postId: string | undefined): ValidationResult => {
  const { error, value } = schema.validate({ postId })

  return {
    error: error && error.details[0].message,
    value
  }
}
