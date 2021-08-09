import TempResolvers from './models/tmp/tmp.resolvers'
// import { AuthenticationMutations } from './models/authentication/authentication.resolvers'

console.log({ TempResolvers })

const Query = {
  ...TempResolvers.Query
}

// const Mutation = {
//   ...AuthenticationMutations
// }

export const resolvers = {
  Query
  // Mutation
}
