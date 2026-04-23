import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
} from '@nestjs/common';
import { AdminResponse } from '../admin.response';
import type { AuthRequest } from '../auth.request';
import { CreateUserDto } from '../create-user.dto';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { LoginDto } from '../login.dto';
import { LoginResponse } from '../login.response';
import { Role } from '../role.enum';
import { User } from '../user.entity';
import { UsersService } from '../users.service';
import { AuthService } from './auth.service';
// import { AuthGuard } from '../auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  public async register(@Body() body: CreateUserDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('/login')
  @Public()
  public async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const response = await this.authService.login(body.email, body.password);

    return new LoginResponse(response);
  }

  @Get('/profile')
  // @UseGuards(AuthGuard)
  async profile(@Request() req: AuthRequest): Promise<User> {
    const user = await this.usersService.findOneById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as User;
  }

  @Get('/admin')
  @Roles(Role.ADMIN, Role.USER)
  adminOnly(): Promise<AdminResponse> {
    return Promise.resolve(
      new AdminResponse({
        message: 'Admin only',
      }),
    );
  }
}
