import * as dotenv from 'dotenv';
import requestIp from 'request-ip'

dotenv.config();

import express from 'express';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import globalResolvers from './graphql/GlobalResolvers';
import globalQuery from './graphql/TypeDefinitions';
import { getUser } from './graphql/auth';
import { connectToDb } from './db';
import { graphqlUploadExpress } from 'graphql-upload';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type {
  GraphQLResponse,
  GraphQLRequestContext
} from 'apollo-server-types';
import isbot from 'isbot';

const port = 4000;

const corsOptions = {
  origin: '*',
  credentials: true,
  exposedHeaders: ['client-version']
};

(async () => {
  await connectToDb();

  const app = express();
  app.set('trust proxy', true)
  app.use(requestIp.mw())
  app.use(graphqlUploadExpress());

  // subscriptions
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs: globalQuery,
    resolvers: globalResolvers
  });

  const server = new ApolloServer({
    schema,
    context: async ({req}) => {
      const token = req.headers.authorization || '';
      const user = await getUser(token);

      if (isbot(req.headers['user-agent'])) {
        throw new Error("Suspicious device detected")
      }

      return {
        ip: req.clientIp,
        userAgent: req.headers['user-agent'],
        user
      };
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          };
        }
      }
    ],
    formatResponse: (
      response: Nullable<GraphQLResponse>,
      requestContext: GraphQLRequestContext<any>
    ) => {
      if (requestContext.response && requestContext.response.http) {
        requestContext.response.http.headers.set(
          'client-version',
          process.env.CLIENT_VERSION || ''
        );
      }
      return response as GraphQLResponse;
    }
  });

  await server.start();
  server.applyMiddleware({ app, cors: corsOptions });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe
    },
    {
      server: httpServer,
      path: server.graphqlPath
    }
  );

  await new Promise<void>(r => httpServer.listen({ port }, r));

  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${port}${
      server.graphqlPath
    }`
  );
})();
