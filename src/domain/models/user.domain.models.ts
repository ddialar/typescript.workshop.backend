export interface UserDomainModel {
  id: string
  username: string
  password: string
  email: string
  name: string
  surname: string
  avatar: string
  token: string
  enabled: boolean
  deleted: boolean
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

export type NewUserDomainModel = Pick<UserDomainModel, 'username' | 'password' | 'email' | 'name' | 'surname' | 'avatar'>
export type RegisteredUserDomainModel = Pick<UserDomainModel, 'username'> & { fullName: string }
export type UpdateUserPayloadDomainModel = Omit<Partial<UserDomainModel>, 'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'>
export type UserProfileDomainModel = Pick<UserDomainModel, 'username' | 'email' | 'name' | 'surname' | 'avatar'>
export type NewUserProfileDomainModel = Partial<Pick<UserDomainModel, 'name' | 'surname' | 'avatar'>>
export type AuthenticatedUserDomainModel = Pick<UserDomainModel, 'token'>
