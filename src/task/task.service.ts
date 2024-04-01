import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './interface/task-service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskRepository } from './interface/task-repository.interface';
import { TASK_REPOSITORY } from './constants/task-repository.constant';
import { Task } from './entities/task.entity';
import { DateRange } from './interface/data-range.interface';
import { RedisService } from '../provider/redis.provider';
import { calculateWeeklyRanges } from './utils/calculate-weekly-ranges.util';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as console from 'console';
import { PaginatedTasksResult } from './dto/task-paginated.dto';

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

  findTasks(page: number, limit: number): Promise<PaginatedTasksResult> {
    return this.taskRepository.findTasks(page, limit);
  }

  async triggerCheckOverdueTasks(
    range: DateRange,
    batchId: string,
  ): Promise<void> {
    const results = await this.taskRepository.triggerCheckOverdueTasks(range);
    await this.redisService.set(
      `${batchId}:results:${range.start}-${range.end}`,
      JSON.stringify(results),
    );

    await this.redisService.set(
      `${batchId}:jobCompleted:${range.start}-${range.end}`,
      'true',
    );

    const totalJobsStr = await this.redisService.get(`${batchId}:totalJobs`);
    const totalJobs = totalJobsStr ? parseInt(totalJobsStr, 10) : 0;

    const keys = await this.redisService.keys(`${batchId}:jobCompleted:*`);
    const completedJobs = keys.length;

    console.log(`Completed jobs: ${completedJobs}/${totalJobs}`);

    if (completedJobs === totalJobs) {
      await this.consolidateResults(batchId);
      await this.cleanupBatch(batchId);
    }
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
  private async cleanupBatch(batchId: string): Promise<void> {
    const keys = await this.redisService.keys(`${batchId}:*`);
    for (const key of keys) {
      await this.redisService.del(key);
    }
    console.log(`Cleanup completed for batch ${batchId}.`);
  }

  private async consolidateResults(batchId: string): Promise<void> {
    const keysPattern = `${batchId}:results:*`;
    const keys = await this.redisService.keys(keysPattern);

    if (keys.length === 0) {
      console.log(`No results found for batchId ${batchId}`);
      return;
    }

    const resultsPromises = keys.map((key) => this.redisService.get(key));
    const serializedResults = await Promise.all(resultsPromises);
    const results = serializedResults
      .filter((result) => result !== null)
      .map((result) => JSON.parse(result));

    const consolidatedResults = [].concat(...results);
    // TODO: Save consolidated results to a file or database or send SQS or SNS notification
    console.log(
      `Consolidated results for batchId ${batchId}:`,
      consolidatedResults,
    );
  }
}
