import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  private readonly logger = new Logger(RedisService.name);

  async getRedisValue<T>(key: string): Promise<T> {
    try {
      const cachedData: T = await this.cache.get(key);
      if (cachedData) {
        this.logger.log('Cached data from redis lab');
        return cachedData;
      }
      return null;
    } catch (err) {
      this.logger.log('Error in getting cached data');
      throw err;
    }
  }

  async getRedisKeysPattern(key: string): Promise<string[]> {
    try {
      const findPattern = await this.cache.store.keys(`*${key}*`);
      return findPattern;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async setRedisValue(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cache.set(
        key,
        value,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // * Set in ms (Wrong ttl type in module that will lead the ttl fail)
        { ttl: ttl ?? 60 * 5 },
      );
      this.logger.log('set data to redis lab');
      return;
    } catch (err) {
      this.logger.log('Error in setting cached data');
      throw err;
    }
  }

  async deleteRedisKeys(key: string) {
    try {
      await this.cache.del(key);
      this.logger.log(`deleted key ${key}`);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async resetRedisKey() {
    try {
      await this.cache.reset();
      this.logger.log('reset all key on redis lab');
    } catch (err) {
      this.logger.log('Error in resetting cached data');
      throw err;
    }
  }
}
