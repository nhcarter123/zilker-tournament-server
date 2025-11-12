import { PubSub } from 'graphql-subscriptions';

// Type definition to match RedisPubSub interface
interface PubSubInterface {
  publish<T>(triggerName: string, payload: T): Promise<void>;
  subscribe(
    triggerName: string,
    onMessage: Function,
    options?: Object
  ): Promise<number>;
  unsubscribe(subId: number): void;
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}

// Using in-memory PubSub for subscriptions
// Note: This works for single-server deployments. For multi-server/horizontal scaling,
// you would need Redis or another shared pub/sub mechanism.
console.log('✅ Using in-memory PubSub for GraphQL subscriptions');

export const pubsub: PubSubInterface = new PubSub() as any;

export default pubsub;

/* ============================================================================
 * REDIS IMPLEMENTATION (KEPT FOR REFERENCE)
 * Uncomment this section if you want to use Redis in the future
 * ============================================================================

import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';

// Redis connection options
const redisOptions: Partial<RedisOptions> = {
  retryStrategy: (times: number) => {
    // Retry for up to 5 attempts
    if (times > 5) {
      console.error('Redis connection failed after 5 retries');
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  },
  connectTimeout: 10000, // 10 second timeout
  lazyConnect: true // Don't connect immediately
};

// Create Redis instances using REDIS_URL
if (!process.env.REDIS_URL) {
  console.warn('⚠️  REDIS_URL not set - subscriptions will not work');
}

const publisher = new Redis(process.env.REDIS_URL || '', redisOptions);
const subscriber = new Redis(process.env.REDIS_URL || '', redisOptions);

// Handle Redis connection errors gracefully
publisher.on('error', err => {
  console.error('Redis Publisher Error:', err.message);
});

subscriber.on('error', err => {
  console.error('Redis Subscriber Error:', err.message);
});

publisher.on('connect', () => {
  console.log('✅ Redis Publisher connected');
});

subscriber.on('connect', () => {
  console.log('✅ Redis Subscriber connected');
});

// Try to connect
publisher.connect().catch(err => {
  console.error('Failed to connect Redis Publisher:', err.message);
});

subscriber.connect().catch(err => {
  console.error('Failed to connect Redis Subscriber:', err.message);
});

export const pubsub = new RedisPubSub({
  publisher: publisher as any,
  subscriber: subscriber as any
});

export default pubsub;

============================================================================ */
