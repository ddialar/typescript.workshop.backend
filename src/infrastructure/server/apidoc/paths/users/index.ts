import { signin } from './signin.path'
import { getProfile } from './getProfile.path'
import { updateProfile } from './updateProfile.path'

export const users = {
  '/signin': {
    post: signin
  },
  '/profile': {
    get: getProfile,
    put: updateProfile
  }
}
