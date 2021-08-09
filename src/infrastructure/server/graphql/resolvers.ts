import { AuthenticationMutations } from './models/authentication/authentication.resolver'

const Query = {}

const Mutation = {
  ...AuthenticationMutations
}

export const resolvers = {
  Query,
  Mutation
}
