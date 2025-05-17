import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
            ...createUserDto,
            roles: [UserRole.USER],
        });
        const saved = await this.userRepository.save(user);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('用户不存在');
        }
        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOneBy({ username });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: [{ username }, { email }],
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        // 检查电子邮箱是否已被其他用户使用
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new BadRequestException('该电子邮箱已被使用');
            }
        }

        // 检查用户名是否已被其他用户使用
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updateUserDto.username },
            });
            if (existingUser) {
                throw new BadRequestException('该用户名已被使用');
            }
        }

        // 更新用户信息
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findById(id);
        await this.userRepository.remove(user);
    }
}
