import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/interface/user-service.interface';
import { USER_SERVICE } from '../user/constants/user-service.constant';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { compare, hash } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }
    const isMatch = await compare(pass, user.password);
    if (!isMatch) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: CreateUserDto) {
    const hashedPassword = await hash(userDto.password, 10); // 10 es el número de rondas de sal
    const newUser = {
      ...userDto,
      password: hashedPassword,
    };

    return this.userService.create(newUser);
  }
}
