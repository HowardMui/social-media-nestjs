import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  exports: [],
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
          },
          database: 0,
          username: config.get('REDIS_USERNAME'),
          password: config.get('REDIS_PASSWORD'),
          ttl: 60,
        });

        return {
          store: store as unknown as CacheStore,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
})
export class CustomCacheModule {}
