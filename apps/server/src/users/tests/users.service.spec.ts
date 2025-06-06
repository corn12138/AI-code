import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // 修复导入路径
import { UsersService } from '../users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        find: jest.fn(),
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

    describe('findOne', () => {
        it('should return a user by id', async () => {
            const mockUser = { id: 'test-id', username: 'testuser' };
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

            const result = await service.findOne('test-id');
            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 'test-id' },
            });
        });
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            const mockUser = { email: 'test@example.com', username: 'testuser' };
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

            const result = await service.findByEmail('test@example.com');
            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });

    describe('findByUsername', () => {
        it('should return a user by username', async () => {
            const mockUser = { username: 'testuser', email: 'test@example.com' };
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

            const result = await service.findByUsername('testuser');
            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
        });
    });

    describe('findByUsernameOrEmail', () => {
        it('should return a user by username or email', async () => {
            const mockUser = { username: 'testuser', email: 'test@example.com' };
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

            const result = await service.findByUsernameOrEmail('testuser');
            expect(result).toEqual(mockUser);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: [
                    { username: 'testuser' },
                    { email: 'testuser' },
                ],
            });
        });
    });
// 这是一个测试文件，用于测试 UsersService 的功能
    describe('updateRefreshToken', () => {
        it('should update user refresh token', async () => {
            const mockHashedToken = 'hashed-token';
            (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedToken);

            await service.updateRefreshToken('user-id', 'refresh-token');

            expect(bcrypt.hash).toHaveBeenCalledWith('refresh-token', 10);
            expect(repository.update).toHaveBeenCalledWith(
                'user-id',
                { refreshToken: mockHashedToken },
            );
        });

        it('should set refreshToken to null when token is null', async () => {
            await service.updateRefreshToken('user-id', null);

            expect(repository.update).toHaveBeenCalledWith(
                'user-id',
                { refreshToken: null },
            );
        });
    });
});
