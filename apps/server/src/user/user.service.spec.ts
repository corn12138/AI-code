import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { createMockRepository } from '../../test/utils/test-helpers';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

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

      const savedUser = factories.user.create({
        ...createUserDto,
        id: 'user-id-123',
      });

      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        roles: ['user'],
      });
      expect(result).toEqual(savedUser);
    });
  });

  describe('findAll', () => {
    it('应该返回所有用户', async () => {
      const users = factories.user.createMany(3);
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('应该根据 ID 返回用户', async () => {
      const userId = 'user-id-123';
      const user = factories.user.create({ id: userId });
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(user);
    });

    it('应该在用户不存在时抛出 NotFoundException', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(
        new NotFoundException('用户不存在')
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

  describe('findByEmail', () => {
    it('应该根据邮箱查找用户', async () => {
      const email = 'test@example.com';
      const user = factories.user.create({ email });
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });
  });

  describe('findByUsername', () => {
    it('应该根据用户名查找用户', async () => {
      const username = 'testuser';
      const user = factories.user.create({ username });
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findByUsername(username);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ username });
      expect(result).toEqual(user);
    });
  });
});