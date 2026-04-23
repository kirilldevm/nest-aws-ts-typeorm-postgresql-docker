import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { PasswordService } from './password/password.service';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly passwordService: PasswordService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async findOneByEmail(
    email: string,
  ): Promise<User | NotFoundException> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /** Returns user or null; does not throw when not found (for registration check) */
  public async findOneByEmailOrNull(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  public async findOneById(id: string): Promise<User | NotFoundException> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
