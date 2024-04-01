import { Module } from '@nestjs/common';
import { TaskServiceImpl } from './task.service';
import { TaskController } from './task.controller';
import { TASK_SERVICE } from './constants/task-service.constant';
import { PrismaProvider } from '../provider/prisma.provider';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskPrismaRepository } from './repository/task-prisma.repository';
import { TASK_REPOSITORY } from './constants/task-repository.constant';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisService } from '../provider/redis.provider';
import { TasksProcessor } from './queue/task.processor';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'task-queue',
    }),
  ],
  controllers: [TaskController],
  providers: [
    PrismaProvider,
    TasksProcessor,
    RedisService,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskPrismaRepository,
    },
    {
      provide: TASK_SERVICE,
      useClass: TaskServiceImpl,
    },
  ],
  exports: [TASK_SERVICE],
})
export class TaskModule {}
