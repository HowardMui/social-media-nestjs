import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class CronjobsService {
  constructor(private prisma: PrismaSrcService) {}
  private readonly logger = new Logger(CronjobsService.name);

  @Cron(CronExpression.EVERY_QUARTER, { name: 'Reset logTable' })
  async deleteUserLogTableEverMinute() {
    try {
      this.logger.warn("It's time to reset user table log");
      await this.prisma.logTable.deleteMany({});
      this.logger.warn('Log table was reset successfully');
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
