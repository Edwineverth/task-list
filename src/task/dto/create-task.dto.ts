import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Aprender NestJS',
    description: 'El título de la tarea',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '2023-12-31T23:59:59.999Z',
    description: 'Fecha de vencimiento de la tarea',
  })
  @IsNotEmpty()
  @IsString()
  dueBy: Date;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario responsable de la tarea',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
