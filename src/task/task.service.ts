import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './interface/task-service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskRepository } from './interface/task-repository.interface';
import { TASK_REPOSITORY } from './constants/task-repository.constant';
import { Task } from './entities/task.entity';
import { PaginatedTasksResult } from './dto/task-paginated.dto';
import { DateRange } from './interface/data-range.interface';
import { RedisService } from '../provider/redis.provider';
import { calculateWeeklyRanges } from './utils/calculate-weekly-ranges.util';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TaskServiceImpl implements TaskService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    private readonly redisService: RedisService,
    @InjectQueue('task-queue') private tasksQueue: Queue,
  ) {}
  async create(createTaskDto: CreateTaskDto) {
    return this.taskRepository.createTask(createTaskDto);
  }

  async findAll() {
    return this.taskRepository.getTasks();
  }

  async findOne(id: number) {
    return this.taskRepository.getTask(id);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.updateTask(id, updateTaskDto);

    this.eventEmitter.emit('task.updated', task);
    return task;
  }

  async remove(id: number) {
    return this.taskRepository.deleteTask(id);
  }

  async findOverdueTasks(): Promise<Task[]> {
    return this.taskRepository.findOverdueTasks();
  }

  async triggerCheckOverdueTasks(
    range: DateRange,
    batchId: string,
  ): Promise<void> {
    const results = await this.taskRepository.triggerCheckOverdueTasks(range);
    await this.redisService.set(
      `${batchId}:${range.start}-${range.end}`,
      JSON.stringify(results),
    );

    await this.redisService.incr(`${batchId}:completedCount`);

    const totalJobs = parseInt(
      await this.redisService.get(`${batchId}:totalJobs`),
    );
    const completedJobs = parseInt(
      await this.redisService.get(`${batchId}:completedCount`),
    );

    console.log(`Completed jobs: ${completedJobs}/${totalJobs}`);

    if (completedJobs === totalJobs) {
      const keys = await this.redisService.keys(`${batchId}:results:*`);
      const resultsPromises = keys.map((key) => this.redisService.get(key));
      const results = await Promise.all(resultsPromises);

      const allResults = results.flatMap((result) => JSON.parse(result));
      console.log(`All results for batch ${batchId}:`, allResults);
    }
  }

  async findTasks(page: number, limit: number): Promise<PaginatedTasksResult> {
    return this.taskRepository.findTasks(page, limit);
  }

  async handleCron() {
    const month = new Date();
    const batchId = `${month.getFullYear()}-${month.getMonth() + 1}`;

    console.log(
      `Starting monthly task processing for month: ${month.getMonth() + 1}`,
    );
    const weeklyRanges = calculateWeeklyRanges(month);

    const totalJobs = weeklyRanges.length;
    console.log(`Total jobs to process: ${totalJobs}`);
    await this.redisService.set(`${batchId}:totalJobs`, totalJobs.toString());
    console.log('Enqueuing jobs...');
    weeklyRanges.forEach((range, index) => {
      console.log(`Enqueuing job ${index + 1}:`, range, batchId);
      this.tasksQueue
        .add('check-overdue', { range, batchId })
        .then((data) =>
          console.log(`Job ${index + 1} enqueued successfully`, data.data),
        )
        .catch((error) =>
          console.error(`Error enqueuing job ${index + 1}:`, error),
        );
    });
    this.tasksQueue.on('error', (err) => {
      console.error('Queue error:', err);
    });

    this.tasksQueue.on('waiting', (jobId) => {
      console.log(`Job ${jobId} is waiting`);
    });
  }
}
