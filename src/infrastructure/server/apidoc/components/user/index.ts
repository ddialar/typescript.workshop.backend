import { userProfileComponent } from './UserProfile'
import { newUserInputComponent } from './NewUserInput'
import { newUserProfileDataInputComponent } from './NewUserProfileDataInput'

export const user = {
  ...userProfileComponent,
  ...newUserInputComponent,
  ...newUserProfileDataInputComponent
}
