import { Response, NextFunction } from 'express'
import { PostCommentError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validatePostCommentParams } from '@infrastructure/server/validators'

export const validatePostComment = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { postId, commentId } = req.body

    const { error, value } = validatePostCommentParams({ postId, commentId })

    if (error) {
      throw new PostCommentError(error)
    }

    req.postComment = value

    return next()
  } catch (error) {
    return next(error)
  }
}
