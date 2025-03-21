import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('by-cv/:cvId')
  async getUserByCvId(@Param('cvId') cvId: string) {
    try {
      const user = await this.userService.findByCvId(cvId);
      if (!user) {
        throw new NotFoundException(`User with CV ID ${cvId} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error finding user with CV ID ${cvId}: ${error.message}`);
    }
  }
  @Get('cv-list')
async getCvList() {
  return this.userService.getCvList();
}

}