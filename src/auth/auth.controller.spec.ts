import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

const mockAuthService = {
  login: jest
    .fn()
    .mockImplementation((user) =>
      Promise.resolve({ accessToken: 'mockAccessToken' }),
    ),
  register: jest
    .fn()
    .mockImplementation((dto) => Promise.resolve({ ...dto, id: 1 })),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const req = { user: { username: 'test', sub: 1 } }; // `sub` suele ser el ID del usuario
      const result = await controller.login(req);
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('register', () => {
    it('should create a new user and return the user data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await controller.register(createUserDto);
      expect(result).toEqual({
        message: 'User has been created successfully',
        user: {
          email: 'test@example.com',
        },
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });
});
