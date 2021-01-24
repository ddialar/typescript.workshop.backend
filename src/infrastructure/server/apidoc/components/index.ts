import { common } from './common'
import { authentication } from './authentication'
import { user } from './user'
import { posts } from './post'

export const components = {
  ...common,
  ...authentication,
  ...user,
  ...posts
}
