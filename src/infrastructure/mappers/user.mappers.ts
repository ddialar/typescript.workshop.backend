import { NewUserInputDto, UserDto } from '@infrastructure/dtos'
import { NewUserDomainModel, RegisteredUserDomainModel, UserDomainModel, UserProfileDomainModel } from '@domainModels'

export const mapUserFromDtoToRegisteredDomainModel = (user: UserDto): RegisteredUserDomainModel => {
  const { username, name, surname, avatar } = user

  return {
    username,
    fullName: `${name} ${surname}`,
    avatar
  }
}

export const mapUserFromDtoToDomainModel = (user: UserDto | null): UserDomainModel | null => {
  if (!user) { return user }
  const { _id, ...otherUserfields } = user

  return {
    id: _id.toString(),
    ...otherUserfields
  }
}

export const mapNewUserFromDtoToDomainModel = (newUserDto: NewUserInputDto): NewUserDomainModel => {
  const { email } = newUserDto

  return {
    ...newUserDto,
    username: email
  }
}

export const mapUserFromDtoToProfileDomainModel = (user: UserDto | null): UserProfileDomainModel | null => {
  if (!user) { return user }
  const { username, email, name, surname, avatar } = user

  return {
    username,
    email,
    name,
    surname,
    avatar
  }
}
