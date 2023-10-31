import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { UserLogModel } from 'src/models';

@Injectable()
export class CronjobsService {
  constructor(
    @InjectModel(UserLogModel)
    private userLogModel: typeof UserLogModel,
  ) {}
  private readonly logger = new Logger(CronjobsService.name);

  @Cron(CronExpression.EVERY_QUARTER, { name: 'Reset logTable' })
  async deleteUserLogTableEverMinute() {
    try {
      this.logger.warn("It's time to reset user table log");
      await this.userLogModel.destroy({});
      this.logger.log('Log table was reset successfully');
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
