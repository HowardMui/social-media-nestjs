import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { CronjobsController } from './cronjobs.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserLogModel } from 'src/models';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forFeature([UserLogModel]),
  ],
  providers: [CronjobsService],
  controllers: [CronjobsController],
})
export class CronjobsModule {}
