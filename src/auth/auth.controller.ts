import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 201,
    description: 'Usuario autenticado exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario para registro',
  })
  async register(@Body() user: CreateUserDto) {
    const userRegister = await this.authService.register(user);
    return {
      message: 'User has been created successfully',
      user: {
        email: userRegister.email,
      },
    };
  }
}
