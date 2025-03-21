import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  USER = 'USER'
}

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString() 
  dateOfBirth: string; 

  @IsString()
  address: string;

  @IsString()
  @Transform(({ value }) => {
    const phoneNumber = value.toString();
    if (!/^0[0-9]{8}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    return phoneNumber;
  })
  phoneNumber: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}