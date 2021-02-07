import express from 'express'
import { likePost, dislikePost } from '@domainServices'
import { ensureAuthenticated, validatePostLike } from '@infrastructure/server/middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'

import { createLogger } from '@common'
const logger = createLogger('post.endpoints')

const postLikeRoutes = express.Router()

postLikeRoutes.post('/like', ensureAuthenticated, validatePostLike, async (req: RequestDto, res, next) => {
  const { id, name, surname, avatar } = req.user!
  const postId = req.postId!

  logger.debug(`Liking post '${postId}' by user '${id}'.`)

  try {
    res.json(await likePost(postId as string, { id, name, surname, avatar }))
  } catch (error) {
    next(error)
  }
})

postLikeRoutes.delete('/like', ensureAuthenticated, validatePostLike, async (req: RequestDto, res, next) => {
  const { id: likeOwnerId } = req.user!
  const postId = req.postId!

  logger.debug(`Disliking post '${postId}' by user '${likeOwnerId}'.`)

  try {
    await dislikePost(postId as string, likeOwnerId)
    res.send()
  } catch (error) {
    next(error)
  }
})

export { postLikeRoutes }
