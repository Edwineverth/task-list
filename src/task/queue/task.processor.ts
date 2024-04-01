import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TaskService } from '../interface/task-service.interface';
import { TASK_SERVICE } from '../constants/task-service.constant';
import { Inject } from '@nestjs/common';
import { DateRange } from '../interface/data-range.interface';

@Processor('task-queue')
export class TasksProcessor {
  constructor(
    @Inject(TASK_SERVICE)
    private readonly tasksService: TaskService,
  ) {}

  @Process('check-overdue')
  async checkOverdueTasks(job: Job<{ range: DateRange; batchId: string }>) {
    try {
      const { range, batchId } = job.data;
      console.log(
        `Processing overdue tasks for range: ${range.start} to ${range.end} with batchId: ${batchId}`,
      );
      await this.tasksService.triggerCheckOverdueTasks(range, batchId);
      console.log(
        `Finish process overdue tasks for range: ${range.start} to ${range.end}`,
      );
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
    }
  }
}
