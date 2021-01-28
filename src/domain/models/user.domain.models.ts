export interface UserDomainModel {
  id: string
  username: string
  password: string
  email: string
  name: string | null
  surname: string | null
  avatar: string | null
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
export type NewUserProfileDomainModel = Partial<Pick<UserProfileDomainModel, 'name' | 'surname' | 'avatar'>>
export type AuthenticatedUserDomainModel = Pick<UserDomainModel, 'token'>
