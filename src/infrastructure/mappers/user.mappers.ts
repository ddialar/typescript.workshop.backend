import { UserDto } from '@infrastructure/dtos'
import { UserDomainModel } from '@domainModels'

export const mapUserFromDtoToDomainModel = (user: UserDto | null): UserDomainModel | null => {
  if (!user) { return user }
  const { _id, ...otherUserfields } = user

  return {
    id: _id,
    ...otherUserfields
  }
}
