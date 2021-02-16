import { Router } from 'express'
import { getPosts, getPostById, createPost, deletePost, getExtendedPosts } from '@domainServices'
import { ensureAuthenticated } from '../../middlewares'
import { RequestDto } from '@infrastructure/server/serverDtos'

import { postEndpointsLogger } from '@logger'
import { validateNewPost, validatePost } from '@infrastructure/server/middlewares'

const postGeneralRoutes = Router()

postGeneralRoutes.get('/', async (req, res, next) => {
  postEndpointsLogger('debug', 'Retrieving all posts')

  try {
    res.json(await getPosts())
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.get('/ext', ensureAuthenticated, async (req: RequestDto, res, next) => {
  const { id: userId } = req.user!

  postEndpointsLogger('debug', `Retrieving all posts requested by user '${userId}'`)

  try {
    res.json(await getExtendedPosts(userId))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.post('/', ensureAuthenticated, validateNewPost, async (req: RequestDto, res, next) => {
  const { id, name, surname, avatar } = req.user!
  const postBody = req.postBody!

  postEndpointsLogger('debug', `Creating new post by user '${id}'.`)

  try {
    res.json(await createPost({ id, name, surname, avatar }, postBody))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.delete('/', ensureAuthenticated, validatePost('body'), async (req: RequestDto, res, next) => {
  const { id: postOwnerId } = req.user!
  const postId = req.postId!

  postEndpointsLogger('debug', `Deleting post '${postId}' by user '${postOwnerId}'.`)

  try {
    res.json(await deletePost(postId, postOwnerId))
  } catch (error) {
    next(error)
  }
})

postGeneralRoutes.get('/:id', validatePost('params'), async (req: RequestDto, res, next) => {
  const postId = req.postId!

  postEndpointsLogger('debug', `Retrieving post with id '${postId}'.`)

  try {
    res.json(await getPostById(postId))
  } catch (error) {
    next(error)
  }
})

export { postGeneralRoutes }
