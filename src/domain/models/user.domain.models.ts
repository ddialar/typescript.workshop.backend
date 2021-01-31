export interface UserDomainModel {
  id: string
  username: string
  password: string
  email: string
  name: string
  surname: string
  avatar: string
  token: string | null
  enabled: boolean
  deleted: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type NewUserDomainModel = Pick<UserDomainModel, 'username' | 'password' | 'email' | 'name' | 'surname' | 'avatar'>
export type UpdateUserPayloadDomainModel = Omit<Partial<UserDomainModel>, 'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'>
export type UserProfileDomainModel = Pick<UserDomainModel, 'username' | 'email' | 'name' | 'surname' | 'avatar'>
export type NewUserProfileDomainModel = Partial<Pick<UserDomainModel, 'name' | 'surname' | 'avatar'>>
export type AuthenticatedUserDomainModel = Pick<UserDomainModel, 'token'>
