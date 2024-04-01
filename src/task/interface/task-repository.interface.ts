import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { PaginatedTasksResult } from '../dto/task-paginated.dto';
import { DateRange } from './data-range.interface';

export interface TaskRepository {
  getTask(id: number): Promise<Task>;
  createTask(task: CreateTaskDto): Promise<Task>;
  updateTask(id: number, task: UpdateTaskDto): Promise<Task>;
  deleteTask(id: number): Promise<Task>;
  getTasks(): Promise<Task[]>;
  findOverdueTasks(): Promise<Task[]>;
  findTasks(page: number, limit: number): Promise<PaginatedTasksResult>;
  triggerCheckOverdueTasks(range: DateRange): Promise<Task[]>;
}
