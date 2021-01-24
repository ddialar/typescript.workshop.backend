import { loginInputParamsComponent } from './LoginInputParams'
import { authenticatedUserComponent } from './AuthenticatedUser'

export const authentication = {
  ...loginInputParamsComponent,
  ...authenticatedUserComponent
}
