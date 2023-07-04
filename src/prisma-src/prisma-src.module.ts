import { Global, Module } from '@nestjs/common';
import { PrismaSrcService } from './prisma-src.service';

@Global()
@Module({
  providers: [PrismaSrcService],
  exports: [PrismaSrcService],
})
export class PrismaSrcModule {}
