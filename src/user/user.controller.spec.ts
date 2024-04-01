import { USER_SERVICE } from './constants/user-service.constant';

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';

const mockUserService = {
  create: jest.fn((dto) => {
    return { id: Date.now(), ...dto };
  }),
  findAll: jest.fn(() => [
    { id: 1, email: 'usuario@example.com', password: 'contraseñaSegura123' },
  ]),
  findOne: jest.fn((id) => ({
    id,
    email: 'usuario@example.com',
    password: 'contraseñaSegura123',
  })),
  update: jest.fn((id, dto) => ({
    id,
    ...dto,
  })),
  remove: jest.fn((id) => ({ id })),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'usuario@example.com',
        password: 'contraseñaSegura123',
      };
      expect(await controller.create(createUserDto)).toEqual({
        id: expect.any(Number), // Usamos expect.any(Number) porque el ID es generado dinámicamente
        ...createUserDto,
      });
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        {
          id: 1,
          email: 'usuario@example.com',
          password: 'contraseñaSegura123',
        },
      ]);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const id = 1;
      const result = await controller.findOne(id.toString());
      expect(result).toEqual({
        id,
        email: 'usuario@example.com',
        password: 'contraseñaSegura123',
      });
      expect(mockUserService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { email: 'usuario@actualizado.com' };
      const id = 1;
      const result = await controller.update(id.toString(), updateDto);
      expect(result).toEqual({ id, ...updateDto });
      expect(mockUserService.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const id = 1;
      const result = await controller.remove(id.toString());
      expect(result).toEqual({ id });
      expect(mockUserService.remove).toHaveBeenCalledWith(id);
    });
  });
});
