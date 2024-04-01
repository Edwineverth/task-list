import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseGuards,
  Sse,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './interface/task-service.interface';
import { TASK_SERVICE } from './constants/task-service.constant';
import { AuthGuard } from '@nestjs/passport';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Observable, Subject } from 'rxjs';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Task } from './entities/task.entity';
import { PaginatedTasksResult } from './dto/task-paginated.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { calculateWeeklyRanges } from './utils/calculate-weekly-ranges.util';
import { RedisService } from '../provider/redis.provider';

@ApiTags('task')
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  private tasksUpdates = new Subject<any>();

  constructor(
    @Inject(TASK_SERVICE)
    private readonly taskService: TaskService,
  ) {}

  @OnEvent('task.updated')
  handleTaskUpdatedEvent(payload: any) {
    this.tasksUpdates.next({ data: JSON.stringify(payload) });
  }

  @Sse('subscribe')
  subscribe(): Observable<any> {
    return this.tasksUpdates.asObservable();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleCron() {
    await this.taskService.handleCron();
  }

  @Post('/start-process')
  async startProcess() {
    await this.taskService.handleCron();
    return { message: 'Process started successfully' };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente.' })
  @ApiBody({ type: CreateTaskDto })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskService.create(createTaskDto);
  }

  @Get('/paginated')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener tareas con paginación' })
  @ApiResponse({
    status: 200,
    description: 'Tareas obtenidas exitosamente con paginación.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de tareas por página',
  })
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedTasksResult> {
    limit = Math.min(limit, 50);
    return this.taskService.findTasks(page, limit);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente.',
  })
  async findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea a actualizar' })
  @ApiBody({
    type: UpdateTaskDto,
    description: 'Datos de la tarea para actualizar',
  })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea a eliminar' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async remove(@Param('id') id: string): Promise<Task> {
    return this.taskService.remove(+id);
  }
}
