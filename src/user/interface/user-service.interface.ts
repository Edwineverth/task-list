import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export interface UserService {
  findAll(): Promise<User[]>;
  findOne(id: number): Promise<User>;
  create(createUserDto: CreateUserDto): Promise<User>;
  update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: number): Promise<User>;
  findOneByEmail(email: string): Promise<User>;
}
