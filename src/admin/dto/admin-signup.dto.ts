import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminSignUpDTO {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(20)
  displayName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(20)
  loginName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  password: string;
}
