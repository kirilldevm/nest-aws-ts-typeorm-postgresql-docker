import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john.doe@example.com';
    dto.password = 'Password123!';
  });

  it('should be defined', () => {
    expect(CreateUserDto).toBeDefined();
  });

  it('should be valid', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail on invalid email', async () => {
    dto.email = 'john.doe';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.isEmail).toBe('email must be an email');
  });

  // At least 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character
  it('should fail on invalid password', async () => {
    dto.password = 'password';
    const errors = await validate(dto);
    console.log(errors);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.isStrongPassword).toBe(
      'Password must be at least 6 characters long and contain at least 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character',
    );
  });
});
