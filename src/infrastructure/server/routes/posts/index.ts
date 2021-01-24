import express from 'express'

import { postGeneralRoutes } from './post.general.routes'
import { postCommentRoutes } from './post.comment.routes'
import { postLikeRoutes } from './post.like.routes'

const POSTS_PATH = '/posts'

const postRoutes = express.Router()

postRoutes.use(POSTS_PATH, postGeneralRoutes)
postRoutes.use(POSTS_PATH, postCommentRoutes)
postRoutes.use(POSTS_PATH, postLikeRoutes)

export { postRoutes }
