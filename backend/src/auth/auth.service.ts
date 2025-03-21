import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  private async checkEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findFirst({
      where: { email }
    });
    return !!existingUser;
  }

  async getHRUsers() {
    return await this.prisma.user.findMany({
      where: {
        role: 'HR'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true
      }
    });
  }

  async updateUser(id: number, data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let hashedPassword = existingUser.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        password: hashedPassword,
      }
    });
  }


  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const dateOfBirth = new Date(data.dateOfBirth);
    
    if (isNaN(dateOfBirth.getTime())) {
      throw new Error('Invalid date format for dateOfBirth');
    }

    if (await this.checkEmailExists(data.email)) {
      throw new ConflictException('Email already exists');
    }
  
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          dateOfBirth: dateOfBirth,
          role: data.role || 'USER', 
        }
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }


  async login(data: LoginDto) {
    const user = await this.prisma.user.findFirst({ where: { email: data.email } });
    console.log('Found user:', user);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      console.log('No user found with email:', data.email);
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }
  
    const payload = { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }catch (error) {
    console.error('Login error:', error);
    throw error;
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return { message: `User ${user.email} deleted successfully` };
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

}