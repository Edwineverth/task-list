import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../interface/task-repository.interface';
import { PrismaProvider } from '../../provider/prisma.provider';
import { PaginatedTasksResult } from '../dto/task-paginated.dto';
import { Task } from '../entities/task.entity';
import { DateRange } from '../interface/data-range.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class TaskPrismaRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async triggerCheckOverdueTasks(range: DateRange): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        dueBy: {
          gte: range.start,
          lt: range.end,
        },
        status: 'overdue',
      },
      orderBy: {
        dueBy: 'desc',
      },
    });
  }

  async getTask(id: number): Promise<Task> {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        dueBy: createTaskDto.dueBy,
        userId: createTaskDto.userId,
      },
    });
  }

  async updateTask(id: number, task: UpdateTaskDto): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: task,
    });
  }

  async deleteTask(id: number): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  async findOverdueTasks(): Promise<Task[]> {
    const currentDate = new Date();
    return this.prisma.task.findMany({
      where: {
        dueBy: {
          lt: currentDate,
        },
      },
      orderBy: {
        dueBy: 'desc',
      },
    });
  }

  async findTasks(page: number, limit: number): Promise<PaginatedTasksResult> {
    const [data, totalCount] = await Promise.all([
      this.prisma.task.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count(),
    ]);

    return {
      data,
      page,
      limit,
      totalCount,
    };
  }
}
