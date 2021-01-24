import { getAllPosts } from './getAllPosts.path'
import { getPostById } from './getPostById.path'
import { createPost } from './createPost.path'
import { deletePost } from './deletePost.path'
import { createPostComment } from './createPostComment.path'
import { createPostLike } from './createPostLike.path'
import { deletePostComment } from './deletePostComment.path'
import { deletePostLike } from './deletePostLike.path'

export const posts = {
  '/posts': {
    get: getAllPosts,
    post: createPost,
    delete: deletePost
  },
  '/posts/{id}': {
    get: getPostById
  },
  '/posts/comment': {
    post: createPostComment,
    delete: deletePostComment
  },
  '/posts/like': {
    post: createPostLike,
    delete: deletePostLike
  }
}
