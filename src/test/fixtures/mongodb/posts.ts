import { PostDto } from '@infrastructure/dtos'
import { mongodb } from '@infrastructure/orm'

const { models: { Post } } = mongodb

export const cleanPostsCollectionFixture = async () => Post.deleteMany({})

export const savePostFixture = async (postData: PostDto) => (new Post(postData)).save()

export const savePostsFixture = async (postsData: PostDto[]) => Post.insertMany(postsData)

export const getPostByIdFixture = async (postId: string) => {
  const retrievedPost = await Post.findById(postId)
  return retrievedPost ? retrievedPost.toJSON() as PostDto : null
}
