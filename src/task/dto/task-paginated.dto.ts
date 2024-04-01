import { Task } from '../entities/task.entity';

export interface PaginatedTasksResult {
  data: Task[];
  page: number;
  limit: number;
  totalCount: number;
}
