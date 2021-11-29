import { ApolloServer } from 'apollo-server';
import globalResolvers from './graphql/GlobalResolvers';
import globalQuery from './graphql/TypeDefinitions';
import { getUser } from './graphql/auth';
import { connectToDb } from './db';

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

  server.listen(process.env.PORT).then(({ url }) => {
    console.log(`Apollo server ready on ${url}`);
  });
})();
