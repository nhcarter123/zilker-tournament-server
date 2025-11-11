import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';

// Use connection string if available, otherwise construct from individual options
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

// Create Redis instances - ioredis accepts connection strings directly
// Using type assertion to handle version mismatch between ioredis types
const publisher = process.env.REDIS_URL
  ? (new Redis(
      (process.env.REDIS_URL as unknown) as RedisOptions
    ) as InstanceType<typeof Redis>)
  : new Redis(redisOptions);

const subscriber = process.env.REDIS_URL
  ? (new Redis(
      (process.env.REDIS_URL as unknown) as RedisOptions
    ) as InstanceType<typeof Redis>)
  : new Redis(redisOptions);

export const pubsub = new RedisPubSub({
  publisher: publisher as any,
  subscriber: subscriber as any
});

export default pubsub;
