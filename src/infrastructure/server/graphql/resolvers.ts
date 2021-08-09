import { TempQueries } from './models/tmp/tmp.resolvers'
import { AuthenticationMutations } from './models/authentication/authentication.resolvers'

const Query = {
  ...TempQueries
}

const Mutation = {
  ...AuthenticationMutations
}

export const resolvers = {
  Query,
  Mutation
}
