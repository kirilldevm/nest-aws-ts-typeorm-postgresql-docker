import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsStrongPassword(
    {
      minLength: 6,
      minNumbers: 1,
      minUppercase: 1,
      minLowercase: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 6 characters long and contain at least 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character',
    },
  )
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
