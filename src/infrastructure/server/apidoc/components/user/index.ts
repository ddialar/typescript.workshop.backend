import { userProfileComponent } from './UserProfile'
import { newUserInputComponent } from './NewUserInput'
import { newUserProfileDataInputComponent } from './NewUserProfileDataInput'
import { newRegisteredUserComponent } from './NewRegisteredUser'

export const user = {
  ...userProfileComponent,
  ...newUserInputComponent,
  ...newUserProfileDataInputComponent,
  ...newRegisteredUserComponent
}
