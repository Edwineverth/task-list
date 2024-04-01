import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface UserRepository {
  findUserById(id: number): Promise<User>;
  createUser(createUserDto: CreateUserDto): Promise<User>;
  updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(id: number): Promise<User>;
  findAll(): Promise<User[]>;
  findOneByEmail(email: string): Promise<User>;
}
