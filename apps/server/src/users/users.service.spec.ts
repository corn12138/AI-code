import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { User } from '../user/entities/user.entity';
import { UsersService } from './users.service';

describe('usersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
            findOneBy: vi.fn(),
            createQueryBuilder: vi.fn(() => ({
              where: vi.fn().mockReturnThis(),
              andWhere: vi.fn().mockReturnThis(),
              getOne: vi.fn(),
              getMany: vi.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});
