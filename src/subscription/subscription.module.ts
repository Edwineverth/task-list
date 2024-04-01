import { Module } from '@nestjs/common';
import { SubscriptionServiceImpl } from './subscription-service-impl.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionToken } from './constants/subscription.token.interface';
import { PrismaProvider } from '../provider/prisma.provider';

@Module({
  controllers: [SubscriptionController],
  providers: [
    PrismaProvider,
    {
      provide: SubscriptionToken,
      useClass: SubscriptionServiceImpl,
    },
  ],
  exports: [SubscriptionToken],
})
export class SubscriptionModule {}
