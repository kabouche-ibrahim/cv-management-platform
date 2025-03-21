import { 
  Body, 
  Controller, 
  Post, 
  Get,
  Put,
  Delete, 
  HttpCode, 
  Param, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
async login(@Body() loginDto: LoginDto) {
  try {
    const result = await this.authService.login(loginDto);
    console.log('Login response:', result); 
    return result;
  } catch (error) {
    throw new UnauthorizedException(error.message);
  }
}

  @Delete('users/:id')
  @HttpCode(200)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(parseInt(id));
  }

  @Get('hr-users')
  async getHRUsers() {
    return this.authService.getHRUsers();
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() userData: RegisterDto) {
    return this.authService.updateUser(parseInt(id), userData);
  }


  
}
