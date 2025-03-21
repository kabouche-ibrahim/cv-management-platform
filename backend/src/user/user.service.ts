import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByCvId(cvId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        cvId: cvId
      }
    });

    if (!user) {
      throw new NotFoundException(`User with CV ID ${cvId} not found`);
    }

    return user;
  }

  async getCvList() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cvId: true,
      },
    });
  }
  
}