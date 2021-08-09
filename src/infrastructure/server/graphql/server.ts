import { join } from 'path'
import { ApolloServer } from 'apollo-server'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { resolvers } from './resolvers'

import { serverLogger } from '@logger'

const port = parseInt(process.env.SERVER_PORT ?? '3000', 10)

// NOTE You left here. It's needed to define at least one query 'cos right now, we're receiving this error: Error: Query root type must be provided.

const schema = loadSchemaSync(
  // join(__dirname, './schema.graphql'),
  join(process.cwd(), 'src/infrastructure/server/graphql/schema.graphql'),
  {
    loaders: [
      new GraphQLFileLoader()
    ]
  }
)

const server = new ApolloServer({
  schema,
  resolvers
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
