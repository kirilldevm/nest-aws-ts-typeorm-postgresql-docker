import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../create-user.dto';
import { PasswordService } from '../password/password.service';
import { User } from '../user.entity';
import { UsersService } from '../users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async register(createUserDto: CreateUserDto): Promise<User> {
    // Use repository directly - never throws, only returns boolean
    const exists = await this.userRepository.existsBy({
      email: createUserDto.email,
    });

    if (exists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  public async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = (await this.usersService.findOneByEmail(email)) as User;

    if (!(user instanceof User)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    return { accessToken };
  }

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
}
