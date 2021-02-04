import express from 'express'
import { createPostComment, deletePostComment } from '@domainServices'
import { ensureAuthenticated } from '../../middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'

import { createLogger } from '@common'
const logger = createLogger('post.endpoints')

const postCommentRoutes = express.Router()

postCommentRoutes.post('/comment', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id, name, surname, avatar } = req.user!
  const { postId, commentBody } = req.body

  logger.debug(`Commenting post '${postId}' by user '${id}'.`)

  try {
    res.json(await createPostComment(postId as string, commentBody as string, { id, name, surname, avatar }))
  } catch (error) {
    next(error)
  }
})

postCommentRoutes.delete('/comment', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id: commentOwnerId } = req.user!
  const { postId, commentId } = req.body

  logger.debug(`Removing comment '${commentId}' from post '${postId}' by user '${commentOwnerId}'.`)

  try {
    res.json(await deletePostComment(postId as string, commentId as string, commentOwnerId))
  } catch (error) {
    next(error)
  }
})

export { postCommentRoutes }
