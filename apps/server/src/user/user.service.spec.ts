import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { createMockRepository } from '../../test/utils/test-helpers';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let mockUserRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    mockUserRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashed_password';
      const savedUser = factories.user.create({
        ...createUserDto,
        password: hashedPassword,
        id: 'user-id-123',
      });

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });
      expect(result).toEqual(savedUser);
    });

    it('应该在邮箱已存在时抛出 ConflictException', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const existingUser = factories.user.create({
        email: createUserDto.email,
      });

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email or username already exists')
      );
    });
  });

  describe('findAll', () => {
    it('应该返回所有用户（不包含密码）', async () => {
      const users = factories.user.createMany(3);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username', 'firstName', 'lastName', 'bio', 'avatar', 'role', 'isActive', 'emailVerified', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('应该根据 ID 返回用户', async () => {
      const userId = 'user-id-123';
      const user = factories.user.create({ id: userId });
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(result).toEqual(user);
    });

    it('应该在用户不存在时抛出 NotFoundException', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });
  });

  describe('update', () => {
    it('应该成功更新用户信息', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const existingUser = factories.user.create({ id: userId });
      const updatedUser = { ...existingUser, ...updateUserDto };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('validatePassword', () => {
    it('应该在密码正确时返回 true', async () => {
      const plainPassword = 'Test123!';
      const hashedPassword = 'hashed_password';

      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('应该在密码错误时返回 false', async () => {
      const plainPassword = 'WrongPassword';
      const hashedPassword = 'hashed_password';

      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});