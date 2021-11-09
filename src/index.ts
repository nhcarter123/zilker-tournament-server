import { connect } from 'mongoose';
import { ApolloServer } from 'apollo-server';
import globalResolvers from './graphql/GlobalResolvers';
import globalQuery from './graphql/TypeDefinitions';
import { getUser } from './graphql/auth';
import { MONGO_URI, PORT } from './config';

(async () => {
  const info = await connect(MONGO_URI)
    .then(mongoose => mongoose.connections[0])
    .catch(error => {
      console.error(`Unable to connect to database: ${error}`);
      process.exit(1);
    });

  console.log(
    `Connected to mongodb 🍃 at ${info.host}:${info.port}/${info.name}`
  );

  const server = new ApolloServer({
    resolvers: globalResolvers,
    typeDefs: globalQuery,

    context: async ({ req }: any) => {
      // todo can we improve this typing?
      const token = req.headers.authorization ? req.headers.authorization : '';
      const { user } = await getUser(token);
      return {
        user
      };
    }
  });
  server.listen(PORT).then(({ url }) => {
    console.log(`Apollo server ready on ${url}`);
  });
})();
