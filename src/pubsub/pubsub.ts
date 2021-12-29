import { RedisPubSub } from 'graphql-redis-subscriptions';

import Redis from 'ioredis';

const options = {
  host: process.env.REDIS_URL,
  port: parseInt(process.env.REDIS_PORT || ''),
  password: process.env.REDIS_PASSWORD
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});

export default pubsub;
