import { Response, NextFunction } from 'express'
import { PostIdentificationError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validatePostParams } from '@infrastructure/server/validators'

export const validatePost = (postIdFrom: 'body' | 'params') => async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const postIdOrigins = {
      body: req.body.postId,
      params: req.params.id
    }

    const postId = postIdOrigins[postIdFrom]

    const { error, value } = validatePostParams(postId)

    if (error) {
      throw new PostIdentificationError(error)
    }

    req.postId = value.postId

    return next()
  } catch (error) {
    return next(error)
  }
}
