import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionService } from './interface/subscription-service.interface';
import { PrismaProvider } from '../provider/prisma.provider';
import { Subscription } from '@prisma/client';

@Injectable()
export class SubscriptionServiceImpl implements SubscriptionService {
  constructor(private readonly prisma: PrismaProvider) {}
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({
      data: {
        subscriberId: createSubscriptionDto.subscriberId,
        taskId: createSubscriptionDto.taskId,
      },
    });
  }

  async findAll(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany();
  }

  async findOne(id: number) {
    return this.prisma.subscription.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...updateSubscriptionDto,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  findOverdueSubscriptions(): Promise<Subscription[]> {
    return Promise.resolve([]);
  }
}
