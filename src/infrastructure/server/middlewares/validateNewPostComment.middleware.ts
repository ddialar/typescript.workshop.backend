import { Response, NextFunction } from 'express'
import { NewPostCommentError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateNewPostCommentParams } from '@infrastructure/server/validators'

export const validateNewPostComment = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { postId, commentBody } = req.body

    const { error, value } = validateNewPostCommentParams({ postId, commentBody })

    if (error) {
      throw new NewPostCommentError(error)
    }

    req.newPostComment = value

    return next()
  } catch (error) {
    return next(error)
  }
}
