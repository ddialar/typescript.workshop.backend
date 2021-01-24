import express from 'express'
import { getPosts, getPostById, createPost, deletePost } from '@domainServices'
import { ensureAuthenticated } from '../../middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'
import { UserDomainModel } from '@domainModels'

import { createLogger } from '@common'
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

postGeneralRoutes.post('/', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id, name, surname, avatar } = req.user as UserDomainModel
  const { postBody } = req.body

  logger.debug(`Creating new post by user '${id}'.`)

  try {
    res.json(await createPost({ id, name, surname, avatar }, postBody as string))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.delete('/', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id: postOwnerId } = req.user as UserDomainModel
  const { postId } = req.body

  logger.debug(`Deleting post '${postId}' by user '${postOwnerId}'.`)

  try {
    res.json(await deletePost(postId, postOwnerId))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.get('/:id', async (req, res, next) => {
  const postId = req.params.id as string

  logger.debug(`Retrieving post with id '${postId}'.`)

  try {
    res.json(await getPostById(postId))
  } catch (error) {
    next(error)
  }
})

export { postGeneralRoutes }
