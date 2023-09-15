import { HttpStatus, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class CronjobsService {
  constructor(private prisma: PrismaSrcService) {}

  @Cron(CronExpression.EVERY_QUARTER)
  async deleteUserLogTableEverMinute() {
    try {
      await this.prisma.logTable.deleteMany({});
      console.log('deleted user table log', moment().toISOString());
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
