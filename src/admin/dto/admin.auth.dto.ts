import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminAuthDto {
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

export class AdminSigninDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
