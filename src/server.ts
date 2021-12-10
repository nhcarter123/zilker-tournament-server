import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import globalResolvers from './graphql/GlobalResolvers';
import globalQuery from './graphql/TypeDefinitions';
import { getUser } from './graphql/auth';
import { connectToDb } from './db';
import { graphqlUploadExpress } from 'graphql-upload';

(async () => {
  await connectToDb();

  const server = new ApolloServer({
    resolvers: globalResolvers,
    typeDefs: globalQuery,

    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const { user } = await getUser(token);
      return {
        user
      };
    }
  });

  await server.start();

  const app = express();

  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });

  await new Promise<void>(r => app.listen({ port: 4000 }, r));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
})();
