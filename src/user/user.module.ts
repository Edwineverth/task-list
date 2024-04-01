import { Module } from '@nestjs/common';
import { UserServiceImpl } from './user-service-impl.service';
import { UserController } from './user.controller';
import { USER_SERVICE } from './constants/user-service.constant';
import { PrismaProvider } from '../provider/prisma.provider';
import { USER_REPOSITORY } from './constants/user-repository.constant';
import { UserPrismaRepository } from './repository/user-prisma.repository';

@Module({
  controllers: [UserController],
  providers: [
    PrismaProvider,
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserServiceImpl,
    },
  ],
  exports: [USER_SERVICE],
})
export class UserModule {}
