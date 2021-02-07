import { Response, NextFunction } from 'express'
import { PostIdentificationError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validatePostLikeParams } from '@infrastructure/server/validators'

export const validatePostLike = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.body

    const { error, value } = validatePostLikeParams(postId)

    if (error) {
      throw new PostIdentificationError(error)
    }

    req.postId = value?.postId

    return next()
  } catch (error) {
    return next(error)
  }
}
