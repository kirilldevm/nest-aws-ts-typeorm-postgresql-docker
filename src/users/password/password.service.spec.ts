import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PasswordService } from './password.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const mockHash = 'hashedPassword';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
    const password = 'password';
    const hashedPassword = await service.hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(hashedPassword).toBe(mockHash);
  });

  it('should compare passwords', async () => {
    const mockCompare = true;
    (bcrypt.compare as jest.Mock).mockResolvedValue(mockCompare);
    const password = 'password';
    const hashedPassword = 'hashedPassword';
    const result = await service.comparePasswords(password, hashedPassword);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(mockCompare);
  });
});
