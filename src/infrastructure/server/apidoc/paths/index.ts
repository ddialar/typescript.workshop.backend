import { authentication } from './authentication'
import { users } from './users'
import { posts } from './posts'

export const paths = {
  ...authentication,
  ...users,
  ...posts
}
