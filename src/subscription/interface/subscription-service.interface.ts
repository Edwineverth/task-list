import { Subscription } from '@prisma/client';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

export interface SubscriptionService {
  findAll(): Promise<Subscription[]>;
  findOne(id: number): Promise<Subscription>;
  create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
  update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription>;
  remove(id: number): Promise<Subscription>;
  findOverdueSubscriptions(): Promise<Subscription[]>;
}
