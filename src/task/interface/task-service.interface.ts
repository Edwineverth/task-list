import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { PaginatedTasksResult } from '../dto/task-paginated.dto';
import { DateRange } from './data-range.interface';

export interface TaskService {
  findAll(): Promise<Task[]>;
  findOne(id: number): Promise<Task>;
  create(createTaskDto: CreateTaskDto): Promise<Task>;
  update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task>;
  remove(id: number): Promise<Task>;
  findOverdueTasks(): Promise<Task[]>;
  triggerCheckOverdueTasks(range: DateRange, batchId: string): Promise<void>;
  findTasks(page: number, limit: number): Promise<PaginatedTasksResult>;
  handleCron(): Promise<void>;
}
