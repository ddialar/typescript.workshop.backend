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

export type AuthenticatedUserDomainModel = Pick<UserDomainModel, 'token'>
export type UpdateUserPayloadDomainModel = Omit<Partial<UserDomainModel>, 'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'>
