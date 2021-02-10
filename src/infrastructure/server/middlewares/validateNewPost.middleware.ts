import { Response, NextFunction } from 'express'
import { NewPostError } from '@errors'
import { RequestDto } from '../serverDtos'

import { validateNewPostParams } from '@infrastructure/server/validators'

export const validateNewPost = async (req: RequestDto, res: Response, next: NextFunction) => {
  try {
    const { postBody } = req.body

    const { error, value } = validateNewPostParams(postBody)

    if (error) {
      throw new NewPostError(error)
    }

    req.postBody = value.postBody

    return next()
  } catch (error) {
    return next(error)
  }
}
