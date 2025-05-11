import { Injectable, NotFoundException } from '@nestjs/common';
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
            role: UserRole.USER,
        });
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`ID为${id}的用户不存在`);
        }
        return user;
    }

    async findByUsername(username: string): Promise<User> {
        return this.userRepository.findOneBy({ username });
    }

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.findOneBy({ email });
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<User> {
        return this.userRepository.findOne({
            where: [{ username }, { email }],
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findById(id);
        await this.userRepository.remove(user);
    }
}
