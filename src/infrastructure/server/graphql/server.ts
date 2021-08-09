import { join } from 'path'
import { ApolloServer } from 'apollo-server'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers'

import { serverLogger } from '@logger'

const port = parseInt(process.env.SERVER_PORT ?? '3000', 10)

const rawSchema = loadSchemaSync(
  join(process.cwd(), 'src/infrastructure/server/graphql/schema.graphql'),
  {
    loaders: [
      new GraphQLFileLoader()
    ]
  }
)

const schema = addResolversToSchema({
  schema: rawSchema,
  resolvers
})

const server = new ApolloServer({
  schema
})

const runServer = () =>
  server
    .listen({ port })
    .then(({ url }) => serverLogger('info', `GraphQL server running in ${url}`))

const stopServer = () => {
  serverLogger('info', 'Clossing server...')
  server.stop()
}

export { runServer, stopServer }
