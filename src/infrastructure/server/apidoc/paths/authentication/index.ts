import { postLogin } from './postLogin.path'
import { postLogout } from './postLogout.path'

export const authentication = {
  '/login': { post: postLogin },
  '/logout': { post: postLogout }
}
