import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TASK_SERVICE } from './constants/task-service.constant';
import { TaskService } from './interface/task-service.interface';

const mockTaskService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('TaskController', () => {
  let controller: TaskController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: TASK_SERVICE, useValue: mockTaskService },
        { provide: 'BullQueue_tasks', useValue: mockQueue },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TASK_SERVICE);
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskDto = { title: 'Test Task', dueBy: new Date(), userId: 1 };
      mockTaskService.create.mockResolvedValue(taskDto);

      expect(await controller.create(taskDto)).toEqual(taskDto);
      expect(mockTaskService.create).toHaveBeenCalledWith(taskDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [
        { title: 'Test Task 1', dueBy: new Date(), userId: 1 },
        { title: 'Test Task 2', dueBy: new Date(), userId: 2 },
      ];
      mockTaskService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockTaskService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      const task = { title: 'Test Task', dueBy: new Date(), userId: 1 };
      mockTaskService.findOne.mockResolvedValue(task);

      const id = '1'; // Suponiendo que el ID de la tarea es 1
      expect(await controller.findOne(id)).toEqual(task);
      expect(mockTaskService.findOne).toHaveBeenCalledWith(+id);
    });

    it('should handle not found task', async () => {
      mockTaskService.findOne.mockResolvedValue(null);

      const id = '1';
      await expect(controller.findOne(id)).resolves.toBeNull();
      expect(mockTaskService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Test Task',
        dueBy: new Date(),
        userId: 1,
        status: 'completed',
      };
      const id = '1';
      mockTaskService.update.mockResolvedValue({
        ...updateTaskDto,
        id: +id,
      });

      expect(await controller.update(id, updateTaskDto)).toEqual({
        id: +id,
        ...updateTaskDto,
      });
      expect(mockTaskService.update).toHaveBeenCalledWith(+id, updateTaskDto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const id = '1';
      mockTaskService.remove.mockResolvedValue({
        id: +id,
        title: 'Test Task',
        dueBy: new Date(),
        userId: 1,
      });

      expect(await controller.remove(id)).toEqual({
        id: +id,
        title: 'Test Task',
        dueBy: new Date(),
        userId: 1,
      });
      expect(mockTaskService.remove).toHaveBeenCalledWith(+id);
    });
  });
});
