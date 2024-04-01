import { Test, TestingModule } from '@nestjs/testing';
import { TaskServiceImpl } from './task.service';

describe('TaskService', () => {
  let service: TaskServiceImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskServiceImpl],
    }).compile();

    service = module.get<TaskServiceImpl>(TaskServiceImpl);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
