import { Module } from '@nestjs/common';
import { SequelizeSrcService } from './sequelize-src.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from 'src/models';
import { UserAuthModel } from 'src/models/userAuth.model';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          dialect: config.get('MYSQL_DIALECT'),
          host: config.get('MYSQL_HOST'),
          port: config.get('MYSQL_PORT'),
          username: config.get('MYSQL_USERNAME'),
          password: config.get('MYSQL_PASSWORD'),
          database: config.get('MYSQL_DATABASE'),
          autoLoadModels: true,
          synchronize: true,
          retryAttempts: 10000,
          models: [UserModel, UserAuthModel],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SequelizeSrcService],
})
export class SequelizeSrcModule {}
