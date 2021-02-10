import express from 'express'
import { getPosts, getPostById, createPost, deletePost } from '@domainServices'
import { ensureAuthenticated } from '../../middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'

import { createLogger } from '@common'
import { validateNewPost, validatePost } from '@infrastructure/server/middlewares'
const logger = createLogger('post.endpoints')

const postGeneralRoutes = express.Router()

postGeneralRoutes.get('/', async (req, res, next) => {
  logger.debug('Retrieving all posts')

  try {
    res.json(await getPosts())
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.post('/', ensureAuthenticated, validateNewPost, async (req: RequestDto, res, next) => {
  const { id, name, surname, avatar } = req.user!
  const postBody = req.postBody!

  logger.debug(`Creating new post by user '${id}'.`)

  try {
    res.json(await createPost({ id, name, surname, avatar }, postBody as string))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.delete('/', ensureAuthenticated, validatePost('body'), async (req: RequestDto, res, next) => {
  const { id: postOwnerId } = req.user!
  const postId = req.postId!

  logger.debug(`Deleting post '${postId}' by user '${postOwnerId}'.`)

  try {
    res.json(await deletePost(postId as string, postOwnerId))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.get('/:id', validatePost('params'), async (req: RequestDto, res, next) => {
  const postId = req.postId!

  logger.debug(`Retrieving post with id '${postId}'.`)

  try {
    res.json(await getPostById(postId))
  } catch (error) {
    next(error)
  }
})

export { postGeneralRoutes }
