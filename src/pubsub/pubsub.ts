import { MongodbPubSub } from 'graphql-mongoose-subscriptions';

const pubsub = new MongodbPubSub({
  mongooseOptions: {
    url: process.env.DB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  }
});

export default pubsub;
